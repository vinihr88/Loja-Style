import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const selecaoCartao = {
  id: true,
  nome: true,
  slug: true,
  resumo: true,
  marca: true,
  precoCentavos: true,
  precoPromocionalCentavos: true,
  destaque: true,
  lancamento: true,
  categoria: { select: { nome: true, slug: true } },
  imagens: { orderBy: { ordem: "asc" }, take: 2, select: { url: true, alt: true } },
  variantes: { select: { estoque: true, tamanho: true, cor: true, corHex: true } },
} satisfies Prisma.ProdutoSelect;

export type ProdutoCartao = Prisma.ProdutoGetPayload<{ select: typeof selecaoCartao }>;

export function precoFinal(p: { precoCentavos: number; precoPromocionalCentavos: number | null }) {
  return p.precoPromocionalCentavos ?? p.precoCentavos;
}

export function emPromocao(p: { precoCentavos: number; precoPromocionalCentavos: number | null }) {
  return p.precoPromocionalCentavos !== null && p.precoPromocionalCentavos < p.precoCentavos;
}

export function temEstoque(p: { variantes: { estoque: number }[] }) {
  return p.variantes.some((v) => v.estoque > 0);
}

export type FiltrosCatalogo = {
  busca?: string;
  categoria?: string;
  colecao?: string;
  tamanhos?: string[];
  cores?: string[];
  precoMin?: number;
  precoMax?: number;
  promocao?: boolean;
  disponivel?: boolean;
  ordem?: "relevancia" | "menor-preco" | "maior-preco" | "novidades";
  pagina?: number;
  porPagina?: number;
};

function ordenacao(ordem: FiltrosCatalogo["ordem"]): Prisma.ProdutoOrderByWithRelationInput[] {
  switch (ordem) {
    case "menor-preco":
      return [{ precoCentavos: "asc" }];
    case "maior-preco":
      return [{ precoCentavos: "desc" }];
    case "novidades":
      return [{ criadoEm: "desc" }];
    default:
      return [{ destaque: "desc" }, { lancamento: "desc" }, { criadoEm: "desc" }];
  }
}

export async function listarProdutos(filtros: FiltrosCatalogo) {
  const porPagina = Math.min(filtros.porPagina ?? 12, 48);
  const pagina = Math.max(filtros.pagina ?? 1, 1);

  const where: Prisma.ProdutoWhereInput = { ativo: true };

  if (filtros.busca) {
    const termo = filtros.busca.trim();
    where.OR = [
      { nome: { contains: termo } },
      { resumo: { contains: termo } },
      { marca: { contains: termo } },
      { categoria: { nome: { contains: termo } } },
    ];
  }
  if (filtros.categoria) where.categoria = { slug: filtros.categoria };
  if (filtros.colecao) where.colecoes = { some: { slug: filtros.colecao } };
  if (filtros.tamanhos?.length) where.variantes = { some: { tamanho: { in: filtros.tamanhos }, estoque: { gt: 0 } } };
  if (filtros.cores?.length) {
    where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { variantes: { some: { cor: { in: filtros.cores } } } }];
  }
  if (filtros.precoMin !== undefined) where.precoCentavos = { ...(where.precoCentavos as object), gte: filtros.precoMin };
  if (filtros.precoMax !== undefined) where.precoCentavos = { ...(where.precoCentavos as object), lte: filtros.precoMax };
  if (filtros.promocao) where.precoPromocionalCentavos = { not: null };
  if (filtros.disponivel) {
    where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { variantes: { some: { estoque: { gt: 0 } } } }];
  }

  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      select: selecaoCartao,
      orderBy: ordenacao(filtros.ordem),
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.produto.count({ where }),
  ]);

  return { produtos, total, pagina, porPagina, paginas: Math.max(Math.ceil(total / porPagina), 1) };
}

export async function facetas() {
  const [categorias, variantes, faixa] = await Promise.all([
    prisma.categoria.findMany({
      orderBy: { ordem: "asc" },
      select: {
        nome: true,
        slug: true,
        _count: { select: { produtos: { where: { ativo: true } } } },
      },
    }),
    prisma.variante.findMany({
      where: { produto: { ativo: true } },
      select: { tamanho: true, cor: true, corHex: true },
    }),
    prisma.produto.aggregate({
      where: { ativo: true },
      _min: { precoCentavos: true },
      _max: { precoCentavos: true },
    }),
  ]);

  const ordemTamanho = ["PP", "P", "M", "G", "GG", "XG", "38", "40", "42", "44", "46", "48", "ÚNICO"];
  const tamanhos = [...new Set(variantes.map((v) => v.tamanho))].sort(
    (a, b) => ordemTamanho.indexOf(a) - ordemTamanho.indexOf(b),
  );

  const mapaCores = new Map<string, string>();
  for (const v of variantes) if (!mapaCores.has(v.cor)) mapaCores.set(v.cor, v.corHex);

  return {
    categorias,
    tamanhos,
    cores: [...mapaCores].map(([nome, hex]) => ({ nome, hex })).sort((a, b) => a.nome.localeCompare(b.nome)),
    precoMin: faixa._min.precoCentavos ?? 0,
    precoMax: faixa._max.precoCentavos ?? 0,
  };
}

export async function produtoPorSlug(slug: string) {
  return prisma.produto.findFirst({
    where: { slug, ativo: true },
    include: {
      categoria: true,
      colecoes: { select: { nome: true, slug: true } },
      imagens: { orderBy: { ordem: "asc" } },
      variantes: { where: { ativo: true }, orderBy: [{ cor: "asc" }, { tamanho: "asc" }] },
      avaliacoes: { where: { aprovada: true }, orderBy: { criadoEm: "desc" }, take: 20 },
    },
  });
}

export async function notaMedia(produtoId: string) {
  const r = await prisma.avaliacao.aggregate({
    where: { produtoId, aprovada: true },
    _avg: { nota: true },
    _count: true,
  });
  return { media: r._avg.nota ?? 0, quantidade: r._count };
}

export async function relacionados(produtoId: string, categoriaId: string, limite = 4) {
  return prisma.produto.findMany({
    where: { ativo: true, categoriaId, id: { not: produtoId } },
    select: selecaoCartao,
    take: limite,
    orderBy: { destaque: "desc" },
  });
}

export async function vitrine() {
  const [destaques, lancamentos, promocoes, colecoes] = await Promise.all([
    prisma.produto.findMany({
      where: { ativo: true, destaque: true },
      select: selecaoCartao,
      take: 8,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.produto.findMany({
      where: { ativo: true, lancamento: true },
      select: selecaoCartao,
      take: 8,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.produto.findMany({
      where: { ativo: true, precoPromocionalCentavos: { not: null } },
      select: selecaoCartao,
      take: 8,
      orderBy: { criadoEm: "desc" },
    }),
    prisma.colecao.findMany({
      where: { destaque: true },
      orderBy: { ordem: "asc" },
      select: {
        nome: true,
        slug: true,
        descricao: true,
        produtos: { where: { ativo: true }, take: 1, select: { imagens: { take: 1, orderBy: { ordem: "asc" } } } },
        _count: { select: { produtos: { where: { ativo: true } } } },
      },
    }),
  ]);

  return { destaques, lancamentos, promocoes, colecoes };
}

export async function buscarVariantes(ids: string[]) {
  return prisma.variante.findMany({
    where: { id: { in: ids }, ativo: true, produto: { ativo: true } },
    include: {
      produto: {
        select: {
          nome: true,
          slug: true,
          precoCentavos: true,
          precoPromocionalCentavos: true,
          imagens: { take: 1, orderBy: { ordem: "asc" }, select: { url: true } },
        },
      },
    },
  });
}
