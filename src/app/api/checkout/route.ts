import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lembrarPedido, usuarioAtual } from "@/lib/auth";
import { esquemaCheckout, primeiroErro } from "@/lib/validacoes";
import { aplicarCupom, resolverItens } from "@/lib/carrinho";
import { opcaoDeFrete } from "@/lib/frete";
import { gerarNumeroPedido } from "@/lib/pedidos";
import { criarPreferencia, gatewayConfigurado } from "@/lib/mercadopago";
import { ipDaRequisicao, limitar } from "@/lib/limite";
import { STATUS_PEDIDO } from "@/lib/constantes";

export async function POST(req: Request) {
  if (!limitar(`checkout:${ipDaRequisicao(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaCheckout.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const dados = analise.data;
  const { itens, indisponiveis, subtotalCentavos } = await resolverItens(dados.itens);

  if (itens.length === 0) {
    return NextResponse.json({ erro: "Nenhuma peça da sacola está disponível" }, { status: 400 });
  }
  // Quantidade acima do estoque não é reduzida em silêncio: o cliente revisa a sacola.
  for (const pedido of dados.itens) {
    const item = itens.find((i) => i.varianteId === pedido.varianteId);
    if (item && item.quantidade < pedido.quantidade) {
      indisponiveis.push(`${item.produtoNome} ${item.tamanho} (só ${item.estoque} em estoque)`);
    }
  }
  if (indisponiveis.length > 0) {
    return NextResponse.json(
      { erro: `Sem estoque: ${indisponiveis.join(", ")}. Revise a sacola.` },
      { status: 409 },
    );
  }

  let descontoCentavos = 0;
  let cupomCodigo: string | null = null;
  if (dados.cupom) {
    const resultado = await aplicarCupom(dados.cupom, subtotalCentavos);
    if ("erro" in resultado) return NextResponse.json({ erro: resultado.erro }, { status: 400 });
    descontoCentavos = resultado.cupom.descontoCentavos;
    cupomCodigo = resultado.cupom.codigo;
  }

  const frete = opcaoDeFrete(dados.envioMetodo, dados.entrega.cep, subtotalCentavos);
  if (!frete) return NextResponse.json({ erro: "Forma de envio inválida" }, { status: 400 });

  const totalCentavos = Math.max(subtotalCentavos - descontoCentavos, 0) + frete.precoCentavos;
  const usuario = await usuarioAtual();

  const pedido = await prisma.pedido.create({
    data: {
      numero: gerarNumeroPedido(),
      usuarioId: usuario?.id ?? null,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cpf: dados.cpf,
      status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
      subtotalCentavos,
      descontoCentavos,
      freteCentavos: frete.precoCentavos,
      totalCentavos,
      cupomCodigo,
      envioMetodo: frete.metodo,
      envioPrazoDias: frete.prazoDias,
      cep: dados.entrega.cep,
      logradouro: dados.entrega.logradouro,
      numero_: dados.entrega.numero,
      complemento: dados.entrega.complemento || null,
      bairro: dados.entrega.bairro,
      cidade: dados.entrega.cidade,
      uf: dados.entrega.uf,
      itens: {
        create: itens.map((i) => ({
          varianteId: i.varianteId,
          produtoNome: i.produtoNome,
          produtoSlug: i.produtoSlug,
          tamanho: i.tamanho,
          cor: i.cor,
          imagemUrl: i.imagemUrl,
          precoCentavos: i.precoCentavos,
          quantidade: i.quantidade,
        })),
      },
      eventos: {
        create: {
          status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
          descricao: "Pedido criado. Aguardando pagamento.",
        },
      },
    },
  });

  await lembrarPedido(pedido.numero);

  if (!gatewayConfigurado()) {
    return NextResponse.json({ numero: pedido.numero, urlPagamento: null });
  }

  const preferencia = await criarPreferencia({
    numeroPedido: pedido.numero,
    itens: itens.map((i) => ({
      titulo: `${i.produtoNome} ${i.cor} ${i.tamanho}`,
      quantidade: i.quantidade,
      precoCentavos: i.precoCentavos,
    })),
    freteCentavos: frete.precoCentavos,
    descontoCentavos,
    pagador: { nome: dados.nome, email: dados.email, telefone: dados.telefone, cpf: dados.cpf },
  });

  if ("erro" in preferencia) {
    // Pedido fica registrado; o cliente combina o pagamento pelo WhatsApp.
    return NextResponse.json({ numero: pedido.numero, urlPagamento: null });
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { pagamentoId: preferencia.id, pagamentoStatus: "preference_created" },
  });

  return NextResponse.json({ numero: pedido.numero, urlPagamento: preferencia.url });
}
