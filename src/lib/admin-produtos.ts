import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { esquemaProdutoAdmin } from "@/lib/validacoes";
import { sku } from "../../prisma/catalogo";

type DadosProduto = z.infer<typeof esquemaProdutoAdmin>;

// Garante SKU único mesmo quando dois slugs geram a mesma base.
async function skuLivre(tx: Prisma.TransactionClient, slug: string, cor: string, tamanho: string): Promise<string> {
  const base = sku(slug, cor, tamanho);
  let candidato = base;
  let n = 2;
  while (await tx.variante.findUnique({ where: { sku: candidato }, select: { id: true } })) {
    candidato = `${base}-${n}`;
    n += 1;
  }
  return candidato;
}

// Variantes são atualizadas, nunca recriadas: ItemPedido aponta para elas.
// Variante que sumiu do formulário fica inativa em vez de apagada.
export async function salvarProduto(dados: DadosProduto, id?: string) {
  const base = {
    nome: dados.nome,
    slug: dados.slug,
    resumo: dados.resumo,
    descricao: dados.descricao,
    marca: dados.marca || null,
    categoriaId: dados.categoriaId,
    precoCentavos: dados.precoCentavos,
    precoPromocionalCentavos:
      dados.precoPromocionalCentavos && dados.precoPromocionalCentavos > 0 && dados.precoPromocionalCentavos < dados.precoCentavos
        ? dados.precoPromocionalCentavos
        : null,
    ativo: dados.ativo,
    destaque: dados.destaque,
    lancamento: dados.lancamento,
  };

  return prisma.$transaction(async (tx) => {
    const produto = id
      ? await tx.produto.update({ where: { id }, data: base })
      : await tx.produto.create({ data: base });

    await tx.imagemProduto.deleteMany({ where: { produtoId: produto.id } });
    if (dados.imagens.length > 0) {
      await tx.imagemProduto.createMany({
        data: dados.imagens.map((img, ordem) => ({ produtoId: produto.id, url: img.url, alt: img.alt, ordem })),
      });
    }

    const existentes = await tx.variante.findMany({ where: { produtoId: produto.id } });
    const mantidas = new Set<string>();

    for (const v of dados.variantes) {
      const atual = existentes.find(
        (e) => e.id === v.id || (e.tamanho === v.tamanho && e.cor === v.cor),
      );
      if (atual) {
        await tx.variante.update({
          where: { id: atual.id },
          data: { tamanho: v.tamanho, cor: v.cor, corHex: v.corHex, estoque: v.estoque, ativo: v.ativo },
        });
        mantidas.add(atual.id);
      } else {
        const criada = await tx.variante.create({
          data: {
            produtoId: produto.id,
            tamanho: v.tamanho,
            cor: v.cor,
            corHex: v.corHex,
            estoque: v.estoque,
            ativo: v.ativo,
            sku: await skuLivre(tx, dados.slug, v.cor, v.tamanho),
          },
        });
        mantidas.add(criada.id);
      }
    }

    const removidas = existentes.filter((e) => !mantidas.has(e.id));
    if (removidas.length > 0) {
      await tx.variante.updateMany({
        where: { id: { in: removidas.map((r) => r.id) } },
        data: { ativo: false, estoque: 0 },
      });
    }

    return produto;
  });
}

// Peça já vendida não é excluída, é desativada.
export async function removerProduto(id: string): Promise<{ desativado: boolean }> {
  const vendas = await prisma.itemPedido.count({ where: { variante: { produtoId: id } } });
  if (vendas > 0) {
    await prisma.produto.update({ where: { id }, data: { ativo: false } });
    return { desativado: true };
  }
  await prisma.produto.delete({ where: { id } });
  return { desativado: false };
}
