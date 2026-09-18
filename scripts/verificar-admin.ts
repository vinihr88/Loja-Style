// Verifica o painel: login, CRUD de produto e cupom, alteração de status.
// Uso: npm run verificar:admin [url]  (usa ADMIN_EMAIL/ADMIN_SENHA do .env)
try {
  process.loadEnvFile();
} catch {
  // sem .env: usa as variáveis do ambiente
}

import { PrismaClient } from "@prisma/client";

const BASE = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const prisma = new PrismaClient();

let falhas = 0;
let cookie = "";

function ok(condicao: unknown, mensagem: string) {
  if (condicao) console.log(`  ok   ${mensagem}`);
  else {
    falhas += 1;
    console.log(`  FALHA ${mensagem}`);
  }
}

async function chamar(metodo: string, caminho: string, corpo?: unknown) {
  const r = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", cookie },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: r.status, dados: (await r.json().catch(() => ({}))) as Record<string, unknown>, cabecalhos: r.headers };
}

async function principal() {
  console.log(`Verificando painel em ${BASE}\n`);

  console.log("Login");
  const errado = await chamar("POST", "/api/auth/login", { email: process.env.ADMIN_EMAIL, senha: "senha-errada" });
  ok(errado.status === 401, "senha errada recusada");

  const login = await chamar("POST", "/api/auth/login", { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA });
  ok(login.status === 200 && login.dados.admin === true, "login do admin");
  const setCookie = login.cabecalhos.get("set-cookie") ?? "";
  cookie = setCookie.split(";")[0];
  ok(cookie.startsWith("sessao="), "cookie de sessão emitido");
  ok(setCookie.toLowerCase().includes("httponly"), "cookie é httpOnly");

  console.log("\nProduto");
  const categoria = await prisma.categoria.findFirstOrThrow();
  const slug = `teste-verificacao-${Date.now()}`;
  const criar = await chamar("POST", "/api/admin/produtos", {
    nome: "Peça de Verificação",
    slug,
    resumo: "Peça criada pelo script de verificação.",
    descricao: "Descrição longa o suficiente para passar na validação do formulário.",
    marca: "Teste",
    categoriaId: categoria.id,
    precoCentavos: 9990,
    precoPromocionalCentavos: null,
    ativo: true,
    destaque: false,
    lancamento: false,
    imagens: [],
    variantes: [{ tamanho: "M", cor: "Preto", corHex: "#141414", estoque: 3, ativo: true }],
  });
  ok(criar.status === 201, "produto criado");
  const id = criar.dados.id as string;

  const duplicado = await chamar("POST", "/api/admin/produtos", { ...{ nome: "Duplicada", slug, resumo: "resumo ok", descricao: "descrição longa o suficiente aqui", categoriaId: categoria.id, precoCentavos: 1000, imagens: [], variantes: [{ tamanho: "M", cor: "Preto", corHex: "#141414", estoque: 1, ativo: true }] } });
  ok(duplicado.status === 409, "slug duplicado recusado");

  const antes = await prisma.variante.findFirstOrThrow({ where: { produto: { slug } } });
  const editar = await chamar("PUT", `/api/admin/produtos/${id}`, {
    nome: "Peça de Verificação Editada",
    slug,
    resumo: "Resumo editado.",
    descricao: "Descrição editada, ainda longa o suficiente para a validação.",
    marca: "Teste",
    categoriaId: categoria.id,
    precoCentavos: 12990,
    precoPromocionalCentavos: 9990,
    ativo: true,
    destaque: true,
    lancamento: false,
    imagens: [],
    variantes: [{ id: antes.id, tamanho: "M", cor: "Preto", corHex: "#141414", estoque: 7, ativo: true }, { tamanho: "G", cor: "Preto", corHex: "#141414", estoque: 2, ativo: true }],
  });
  ok(editar.status === 200, "produto editado");
  const depois = await prisma.variante.findMany({ where: { produto: { slug } } });
  ok(depois.find((v) => v.tamanho === "M")?.id === antes.id, "variante atualizada, não recriada");
  ok(depois.length === 2, "nova variante adicionada");

  const publico = await fetch(`${BASE}/produto/${slug}`);
  ok(publico.status === 200, "página pública do produto abre");

  console.log("\nEstoque");
  const estoque = await chamar("PATCH", "/api/admin/estoque", { varianteId: antes.id, estoque: 1 });
  ok(estoque.status === 200, "estoque ajustado pela API");

  console.log("\nCupom");
  const codigo = `VERIF${Date.now().toString().slice(-6)}`;
  const cupom = await chamar("POST", "/api/admin/cupons", { codigo, tipo: "PERCENTUAL", valor: 15, minimoCentavos: 0, maxUsos: 10, expiraEm: null, ativo: true });
  ok(cupom.status === 201, "cupom criado");
  const cupomId = (cupom.dados.cupom as { id: string })?.id;
  const desativar = await chamar("PATCH", "/api/admin/cupons", { id: cupomId, ativo: false });
  ok(desativar.status === 200, "cupom desativado");
  const remover = await chamar("DELETE", "/api/admin/cupons", { id: cupomId });
  ok(remover.status === 200, "cupom removido");

  console.log("\nPedido");
  const pedido = await prisma.pedido.create({
    data: {
      numero: `KSVER${Date.now().toString().slice(-6)}`,
      nome: "Cliente Teste",
      email: "cliente@kauastyle.test",
      telefone: "11999990000",
      cpf: "52998224725",
      subtotalCentavos: 9990,
      totalCentavos: 9990,
      envioMetodo: "RETIRADA",
      envioPrazoDias: 1,
      cep: "01310100",
      logradouro: "Av. Paulista",
      numero_: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      itens: { create: { varianteId: antes.id, produtoNome: "Peça de Verificação", produtoSlug: slug, tamanho: "M", cor: "Preto", precoCentavos: 9990, quantidade: 1 } },
    },
  });
  const estoqueAntes = (await prisma.variante.findUniqueOrThrow({ where: { id: antes.id } })).estoque;
  const pagar = await chamar("PATCH", `/api/admin/pedidos/${pedido.id}`, { status: "PAGO", rastreioCodigo: "", observacao: "Pix recebido" });
  ok(pagar.status === 200, "status alterado para PAGO");
  const estoqueDepois = (await prisma.variante.findUniqueOrThrow({ where: { id: antes.id } })).estoque;
  ok(estoqueDepois === estoqueAntes - 1, "registro manual de pagamento baixa o estoque");
  const enviar = await chamar("PATCH", `/api/admin/pedidos/${pedido.id}`, { status: "ENVIADO", rastreioCodigo: "AA123456789BR", observacao: "" });
  ok(enviar.status === 200, "status alterado para ENVIADO com rastreio");
  const p = await prisma.pedido.findUniqueOrThrow({ where: { id: pedido.id }, include: { eventos: true } });
  ok(p.rastreioCodigo === "AA123456789BR" && p.eventos.length >= 2, "rastreio salvo e eventos registrados");

  console.log("\nExclusão");
  const excluir = await chamar("DELETE", `/api/admin/produtos/${id}`);
  ok(excluir.status === 200 && excluir.dados.desativado === true, "peça vendida é desativada, não excluída");

  await prisma.pedido.delete({ where: { id: pedido.id } });
  await prisma.produto.delete({ where: { id } });

  const logout = await chamar("POST", "/api/auth/logout");
  ok(logout.status === 200, "logout");
  const depoisLogout = await chamar("GET", "/api/admin/produtos");
  ok(depoisLogout.status === 401, "sessão revogada no banco: cookie antigo não vale");

  console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} falha(s).`);
  process.exit(falhas === 0 ? 0 : 1);
}

principal()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
