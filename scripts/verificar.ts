// Verifica a loja batendo na API real. Uso: npm run verificar [url]
// Cria um pedido de teste e o cancela ao final.
try {
  process.loadEnvFile();
} catch {
  // sem .env: usa as variáveis do ambiente
}

import { PrismaClient } from "@prisma/client";

const BASE = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const prisma = new PrismaClient();

let falhas = 0;
function ok(condicao: unknown, mensagem: string) {
  if (condicao) console.log(`  ok   ${mensagem}`);
  else {
    falhas += 1;
    console.log(`  FALHA ${mensagem}`);
  }
}

async function post(caminho: string, corpo: unknown) {
  const r = await fetch(`${BASE}${caminho}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  return { status: r.status, dados: (await r.json().catch(() => ({}))) as Record<string, unknown> };
}

async function principal() {
  console.log(`Verificando ${BASE}\n`);

  const variante = await prisma.variante.findFirst({ where: { estoque: { gte: 2 }, ativo: true, produto: { ativo: true } }, include: { produto: true } });
  if (!variante) throw new Error("Nenhuma variante com estoque para testar");
  const preco = variante.produto.precoPromocionalCentavos ?? variante.produto.precoCentavos;

  console.log("Páginas");
  for (const caminho of ["/", "/produtos", `/produto/${variante.produto.slug}`, "/colecoes", "/carrinho", "/checkout", "/rastreio", "/suporte/faq", "/sitemap.xml", "/robots.txt"]) {
    const r = await fetch(`${BASE}${caminho}`);
    ok(r.status === 200, `${caminho} responde 200`);
  }

  console.log("\nFrete e preço");
  const frete = await post("/api/frete", { cep: "01310100", itens: [{ varianteId: variante.id, quantidade: 1 }] });
  ok(frete.status === 200, "frete calcula para CEP de SP");
  ok(frete.dados.subtotalCentavos === preco, "subtotal vem do banco, não do cliente");
  const opcoes = frete.dados.opcoes as { metodo: string; precoCentavos: number }[];
  ok(opcoes?.some((o) => o.metodo === "RETIRADA" && o.precoCentavos === 0), "retirada é grátis");

  const freteInvalido = await post("/api/frete", { cep: "123", itens: [] });
  ok(freteInvalido.status === 400, "frete rejeita CEP inválido");

  console.log("\nCupom");
  const cupom = await post("/api/cupom", { codigo: "BEMVINDO10", itens: [{ varianteId: variante.id, quantidade: 2 }] });
  ok(cupom.status === 200 || cupom.status === 400, "cupom responde");
  const cupomFalso = await post("/api/cupom", { codigo: "NAOEXISTE", itens: [{ varianteId: variante.id, quantidade: 1 }] });
  ok(cupomFalso.status === 400, "cupom inexistente é recusado");

  console.log("\nCheckout");
  const estoqueAntes = variante.estoque;
  const checkout = await post("/api/checkout", {
    nome: "Teste Verificação",
    email: "verificacao@kauastyle.test",
    telefone: "11999998888",
    cpf: "52998224725",
    entrega: { cep: "01310100", logradouro: "Av. Paulista", numero: "1000", complemento: "", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
    envioMetodo: "RETIRADA",
    cupom: "",
    itens: [{ varianteId: variante.id, quantidade: 1 }],
  });
  ok(checkout.status === 200, "pedido criado");
  const numero = checkout.dados.numero as string;
  const pedido = numero ? await prisma.pedido.findUnique({ where: { numero }, include: { itens: true } }) : null;
  ok(pedido?.status === "AGUARDANDO_PAGAMENTO", "status inicial AGUARDANDO_PAGAMENTO");
  ok(pedido?.totalCentavos === preco, "total calculado no servidor");
  ok(pedido?.itens[0]?.produtoNome === variante.produto.nome, "item é snapshot");

  const varianteDepois = await prisma.variante.findUniqueOrThrow({ where: { id: variante.id } });
  ok(varianteDepois.estoque === estoqueAntes, "estoque não baixa na criação do pedido");

  const cpfRuim = await post("/api/checkout", { nome: "X Y", email: "a@b.co", telefone: "11999998888", cpf: "11111111111", entrega: { cep: "01310100", logradouro: "R", numero: "1", bairro: "B", cidade: "C", uf: "SP" }, envioMetodo: "PAC", itens: [{ varianteId: variante.id, quantidade: 1 }] });
  ok(cpfRuim.status === 400, "checkout rejeita CPF inválido");

  console.log("\nConfirmação de pagamento (idempotência)");
  if (pedido) {
    const { confirmarPagamento } = await import("../src/lib/pedidos");
    await confirmarPagamento({ pedidoId: pedido.id, pagamentoId: "teste-1", pagamentoMetodo: "pix", valorPagoCentavos: pedido.totalCentavos, origem: "verificação" });
    await confirmarPagamento({ pedidoId: pedido.id, pagamentoId: "teste-1", pagamentoMetodo: "pix", valorPagoCentavos: pedido.totalCentavos, origem: "verificação" });
    const v2 = await prisma.variante.findUniqueOrThrow({ where: { id: variante.id } });
    ok(v2.estoque === estoqueAntes - 1, "estoque baixa uma vez só, mesmo com duas confirmações");
    const p2 = await prisma.pedido.findUniqueOrThrow({ where: { id: pedido.id } });
    ok(p2.status === "PAGO", "pedido vira PAGO");

    const { atualizarStatus } = await import("../src/lib/pedidos");
    await atualizarStatus({ pedidoId: pedido.id, status: "CANCELADO", autor: "verificação" });
    const v3 = await prisma.variante.findUniqueOrThrow({ where: { id: variante.id } });
    ok(v3.estoque === estoqueAntes, "cancelar devolve o estoque");
  }

  console.log("\nProteção de rotas");
  const admin = await fetch(`${BASE}/api/admin/produtos`);
  ok(admin.status === 401, "API admin exige sessão");
  const painel = await fetch(`${BASE}/admin`, { redirect: "manual" });
  ok(painel.status === 307 || painel.status === 302, "painel redireciona sem sessão");

  const rastreio = await fetch(`${BASE}/rastreio?numero=${numero}&email=verificacao@kauastyle.test`);
  ok(rastreio.status === 200 && (await rastreio.text()).includes(numero), "rastreio encontra pedido por número + e-mail");

  console.log("\nWebhook");
  const webhook = await post("/api/pagamentos/mercadopago/webhook", { type: "payment", data: { id: "0" } });
  ok(webhook.status === 200 || webhook.status === 401, "webhook responde sem quebrar");

  if (pedido) {
    await prisma.pedido.delete({ where: { id: pedido.id } });
    console.log("\nPedido de teste removido.");
  }

  console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} falha(s).`);
  process.exit(falhas === 0 ? 0 : 1);
}

principal()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
