import { prisma } from "@/lib/prisma";
import { buscarVariantes } from "@/lib/consultas";
import { TIPO_CUPOM } from "@/lib/constantes";

export type ItemEntrada = { varianteId: string; quantidade: number };

export type ItemResolvido = {
  varianteId: string;
  produtoNome: string;
  produtoSlug: string;
  tamanho: string;
  cor: string;
  imagemUrl: string | null;
  precoCentavos: number;
  quantidade: number;
  estoque: number;
  totalCentavos: number;
};

// O preço vem sempre do banco. O que o navegador manda é só id e quantidade.
export async function resolverItens(entradas: ItemEntrada[]) {
  const variantes = await buscarVariantes(entradas.map((i) => i.varianteId));
  const itens: ItemResolvido[] = [];
  const indisponiveis: string[] = [];

  for (const entrada of entradas) {
    const v = variantes.find((x) => x.id === entrada.varianteId);
    if (!v) {
      indisponiveis.push(entrada.varianteId);
      continue;
    }

    const preco = v.produto.precoPromocionalCentavos ?? v.produto.precoCentavos;
    const quantidade = Math.min(entrada.quantidade, v.estoque);

    if (quantidade < 1) {
      indisponiveis.push(`${v.produto.nome} ${v.tamanho}`);
      continue;
    }

    itens.push({
      varianteId: v.id,
      produtoNome: v.produto.nome,
      produtoSlug: v.produto.slug,
      tamanho: v.tamanho,
      cor: v.cor,
      imagemUrl: v.produto.imagens[0]?.url ?? null,
      precoCentavos: preco,
      quantidade,
      estoque: v.estoque,
      totalCentavos: preco * quantidade,
    });
  }

  const subtotalCentavos = itens.reduce((soma, i) => soma + i.totalCentavos, 0);
  return { itens, indisponiveis, subtotalCentavos };
}

export type CupomAplicado = { codigo: string; descontoCentavos: number };

export async function aplicarCupom(
  codigo: string,
  subtotalCentavos: number,
): Promise<{ cupom: CupomAplicado } | { erro: string }> {
  const registro = await prisma.cupom.findUnique({ where: { codigo: codigo.toUpperCase() } });

  if (!registro || !registro.ativo) return { erro: "Cupom inválido" };
  if (registro.expiraEm && registro.expiraEm < new Date()) return { erro: "Cupom expirado" };
  if (registro.maxUsos !== null && registro.usos >= registro.maxUsos) return { erro: "Cupom esgotado" };
  if (subtotalCentavos < registro.minimoCentavos) {
    return { erro: `Este cupom vale a partir de ${(registro.minimoCentavos / 100).toFixed(2).replace(".", ",")}` };
  }

  const descontoBruto =
    registro.tipo === TIPO_CUPOM.PERCENTUAL
      ? Math.round((subtotalCentavos * registro.valor) / 100)
      : registro.valor;

  return { cupom: { codigo: registro.codigo, descontoCentavos: Math.min(descontoBruto, subtotalCentavos) } };
}
