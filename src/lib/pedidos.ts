import { prisma } from "@/lib/prisma";
import { ROTULO_STATUS, STATUS_PEDIDO } from "@/lib/constantes";

export function gerarNumeroPedido(): string {
  const agora = new Date();
  const ano = String(agora.getFullYear()).slice(2);
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const aleatorio = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `KS${ano}${mes}${aleatorio}`;
}

export async function registrarEvento(pedidoId: string, status: string, descricao: string) {
  await prisma.eventoPedido.create({ data: { pedidoId, status, descricao } });
}

// Idempotente: o Mercado Pago reenvia a mesma notificação várias vezes e o
// estoque só pode cair uma. A trava é o campo estoqueBaixado do pedido.
export async function confirmarPagamento(params: {
  pedidoId: string;
  pagamentoId: string;
  pagamentoMetodo: string | null;
  valorPagoCentavos: number;
  origem: string;
}): Promise<{ ok: boolean; motivo?: string }> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.pedidoId },
    include: { itens: true },
  });

  if (!pedido) return { ok: false, motivo: "Pedido não encontrado" };
  if (pedido.estoqueBaixado) return { ok: true };
  if (pedido.status === STATUS_PEDIDO.CANCELADO) return { ok: false, motivo: "Pedido cancelado" };

  // O valor pago precisa bater com o total do pedido.
  if (params.valorPagoCentavos < pedido.totalCentavos) {
    await registrarEvento(
      pedido.id,
      pedido.status,
      `Pagamento ${params.pagamentoId} recebido com valor menor que o total. Conferir manualmente.`,
    );
    return { ok: false, motivo: "Valor pago menor que o total do pedido" };
  }

  await prisma.$transaction(async (tx) => {
    const travado = await tx.pedido.updateMany({
      where: { id: pedido.id, estoqueBaixado: false },
      data: {
        estoqueBaixado: true,
        status: STATUS_PEDIDO.PAGO,
        pagamentoId: params.pagamentoId,
        pagamentoStatus: "approved",
        pagamentoMetodo: params.pagamentoMetodo,
        pagoEm: new Date(),
      },
    });

    // Outra chamada já baixou o estoque: nada a fazer.
    if (travado.count === 0) return;

    for (const item of pedido.itens) {
      if (!item.varianteId) continue;
      await tx.variante.update({
        where: { id: item.varianteId },
        data: { estoque: { decrement: item.quantidade } },
      });
    }

    if (pedido.cupomCodigo) {
      await tx.cupom.updateMany({
        where: { codigo: pedido.cupomCodigo },
        data: { usos: { increment: 1 } },
      });
    }

    await tx.eventoPedido.create({
      data: {
        pedidoId: pedido.id,
        status: STATUS_PEDIDO.PAGO,
        descricao: `Pagamento confirmado (${params.origem}). Estoque reservado.`,
      },
    });
  });

  return { ok: true };
}

export async function atualizarStatus(params: {
  pedidoId: string;
  status: string;
  rastreioCodigo?: string | null;
  observacao?: string | null;
  autor: string;
}) {
  const pedido = await prisma.pedido.findUnique({ where: { id: params.pedidoId } });
  if (!pedido) return { ok: false, motivo: "Pedido não encontrado" };

  // Marcar como pago pelo painel também baixa o estoque, uma vez só.
  if (params.status === STATUS_PEDIDO.PAGO && !pedido.estoqueBaixado) {
    await confirmarPagamento({
      pedidoId: pedido.id,
      pagamentoId: pedido.pagamentoId ?? `manual-${pedido.numero}`,
      pagamentoMetodo: pedido.pagamentoMetodo ?? "manual",
      valorPagoCentavos: pedido.totalCentavos,
      origem: `registro manual por ${params.autor}`,
    });
  }

  // Cancelar um pedido já pago devolve as peças ao estoque.
  if (params.status === STATUS_PEDIDO.CANCELADO && pedido.estoqueBaixado) {
    const itens = await prisma.itemPedido.findMany({ where: { pedidoId: pedido.id } });
    await prisma.$transaction(async (tx) => {
      for (const item of itens) {
        if (!item.varianteId) continue;
        await tx.variante.update({
          where: { id: item.varianteId },
          data: { estoque: { increment: item.quantidade } },
        });
      }
      await tx.pedido.update({ where: { id: pedido.id }, data: { estoqueBaixado: false } });
    });
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: {
      status: params.status,
      rastreioCodigo: params.rastreioCodigo?.trim() || pedido.rastreioCodigo,
    },
  });

  const rotulo = ROTULO_STATUS[params.status] ?? params.status;
  await registrarEvento(
    pedido.id,
    params.status,
    params.observacao?.trim() || `Status alterado para ${rotulo} por ${params.autor}.`,
  );

  return { ok: true };
}

export async function pedidoPorNumeroEEmail(numero: string, email: string) {
  return prisma.pedido.findFirst({
    where: { numero: numero.trim().toUpperCase(), email: email.trim().toLowerCase() },
    include: { itens: true, eventos: { orderBy: { criadoEm: "asc" } } },
  });
}
