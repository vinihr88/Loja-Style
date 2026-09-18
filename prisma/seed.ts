// Idempotente: pode rodar quantas vezes quiser.
// Variantes são atualizadas, nunca recriadas — pedidos antigos apontam para elas.
try {
  process.loadEnvFile();
} catch {
  // sem .env: usa as variáveis do ambiente
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIAS, COLECOES, PRODUTOS, sku, variantesDoProduto } from "./catalogo";

const prisma = new PrismaClient();

// Se houver foto real em public/produtos/<slug>, ela ganha do SVG.
function imagensDoProduto(slug: string, nome: string) {
  const pasta = join(process.cwd(), "public", "produtos", slug);
  if (!existsSync(pasta)) return [];

  const arquivos = readdirSync(pasta).sort();
  const reais = arquivos.filter((a) => /\.(jpe?g|png|webp)$/i.test(a));
  const escolhidos = reais.length > 0 ? reais : arquivos.filter((a) => /\.svg$/i.test(a));

  return escolhidos.map((arquivo, i) => ({
    url: `/produtos/${slug}/${arquivo}`,
    alt: `${nome} — foto ${i + 1}`,
    ordem: i,
  }));
}

async function semearAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@kauastyle.com.br").toLowerCase();
  const senha = process.env.ADMIN_SENHA ?? "KauaStyle@2026";
  const senhaHash = await bcrypt.hash(senha, 12);

  await prisma.usuario.upsert({
    where: { email },
    update: { admin: true },
    create: { nome: "Administração", email, senhaHash, admin: true },
  });

  console.log(`Admin pronto: ${email}`);
}

async function semearCatalogo() {
  for (const c of CATEGORIAS) {
    await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, ordem: c.ordem },
      create: c,
    });
  }

  for (const c of COLECOES) {
    await prisma.colecao.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, descricao: c.descricao, destaque: c.destaque, ordem: c.ordem },
      create: c,
    });
  }

  for (const dado of PRODUTOS) {
    const categoria = await prisma.categoria.findUniqueOrThrow({ where: { slug: dado.categoria } });

    const produto = await prisma.produto.upsert({
      where: { slug: dado.slug },
      update: {
        nome: dado.nome,
        resumo: dado.resumo,
        descricao: dado.descricao,
        marca: dado.marca,
        precoCentavos: dado.precoCentavos,
        precoPromocionalCentavos: dado.precoPromocionalCentavos ?? null,
        categoriaId: categoria.id,
        destaque: dado.destaque ?? false,
        lancamento: dado.lancamento ?? false,
        colecoes: { set: dado.colecoes.map((slug) => ({ slug })) },
      },
      create: {
        slug: dado.slug,
        nome: dado.nome,
        resumo: dado.resumo,
        descricao: dado.descricao,
        marca: dado.marca,
        precoCentavos: dado.precoCentavos,
        precoPromocionalCentavos: dado.precoPromocionalCentavos ?? null,
        categoriaId: categoria.id,
        destaque: dado.destaque ?? false,
        lancamento: dado.lancamento ?? false,
        colecoes: { connect: dado.colecoes.map((slug) => ({ slug })) },
      },
    });

    const imagens = imagensDoProduto(dado.slug, dado.nome);
    if (imagens.length > 0) {
      await prisma.imagemProduto.deleteMany({ where: { produtoId: produto.id } });
      await prisma.imagemProduto.createMany({
        data: imagens.map((i) => ({ ...i, produtoId: produto.id })),
      });
    }

    for (const v of variantesDoProduto(dado)) {
      const codigo = sku(dado.slug, v.cor, v.tamanho);
      await prisma.variante.upsert({
        where: { produtoId_tamanho_cor: { produtoId: produto.id, tamanho: v.tamanho, cor: v.cor } },
        update: { corHex: v.corHex, sku: codigo, ativo: true },
        create: {
          produtoId: produto.id,
          tamanho: v.tamanho,
          cor: v.cor,
          corHex: v.corHex,
          sku: codigo,
          estoque: v.estoque,
        },
      });
    }
  }

  console.log(`${PRODUTOS.length} peças no catálogo.`);
}

async function semearCupons() {
  const cupons = [
    { codigo: "BEMVINDO10", tipo: "PERCENTUAL", valor: 10, minimoCentavos: 15000, maxUsos: 500 },
    { codigo: "FRETEMAIS", tipo: "VALOR", valor: 2000, minimoCentavos: 25000, maxUsos: 200 },
  ];

  for (const c of cupons) {
    await prisma.cupom.upsert({
      where: { codigo: c.codigo },
      update: { ativo: true },
      create: c,
    });
  }

  console.log(`${cupons.length} cupons ativos.`);
}

async function semearAvaliacoes() {
  const amostras = [
    { slug: "conjunto-casablanca-noir", nome: "Rafael M.", nota: 5, comentario: "Tecido muito melhor do que eu esperava pelo preço. Usei num casamento e recebi elogio a noite toda." },
    { slug: "camiseta-balmain-paris-strass", nome: "Diego S.", nota: 5, comentario: "As pedras são bem fixadas mesmo. Já lavei três vezes à mão e não soltou nenhuma." },
    { slug: "camiseta-ea7-logo-oval", nome: "Lucas P.", nota: 4, comentario: "Camiseta pesada, não fica transparente. O M ficou um pouco justo pra mim, peguei o G depois." },
    { slug: "bone-gucci-gg-preto", nome: "Vitor A.", nota: 5, comentario: "Aba firme, bordado bem feito. Chegou em três dias em Campinas." },
    { slug: "jaqueta-balmain-dourada", nome: "Enzo R.", nota: 5, comentario: "Peça de impacto. O dourado não é brega ao vivo, é mais fechado do que na foto." },
    { slug: "calca-city-denim-86-black", nome: "Gabriel T.", nota: 4, comentario: "Preto firme, não desbotou na primeira lavagem. Cós um pouco alto pro meu gosto." },
  ];

  for (const a of amostras) {
    const produto = await prisma.produto.findUnique({ where: { slug: a.slug } });
    if (!produto) continue;

    const existente = await prisma.avaliacao.findFirst({
      where: { produtoId: produto.id, nome: a.nome },
    });
    if (existente) continue;

    await prisma.avaliacao.create({
      data: {
        produtoId: produto.id,
        nome: a.nome,
        nota: a.nota,
        comentario: a.comentario,
        aprovada: true,
      },
    });
  }
}

async function principal() {
  await semearAdmin();
  await semearCatalogo();
  await semearCupons();
  await semearAvaliacoes();
}

principal()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
