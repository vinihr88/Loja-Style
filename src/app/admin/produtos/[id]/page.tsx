import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormularioProduto } from "@/components/admin/formulario-produto";

export default async function PaginaEditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [produto, categorias] = await Promise.all([
    prisma.produto.findUnique({
      where: { id },
      include: { imagens: { orderBy: { ordem: "asc" } }, variantes: { orderBy: [{ cor: "asc" }, { tamanho: "asc" }] } },
    }),
    prisma.categoria.findMany({ orderBy: { ordem: "asc" }, select: { id: true, nome: true } }),
  ]);
  if (!produto) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/produtos" className="text-sm text-ardosia-600 underline underline-offset-4">
          ← produtos
        </Link>
        <Link href={`/produto/${produto.slug}`} target="_blank" className="text-sm text-ardosia-600 underline underline-offset-4">
          ver na loja
        </Link>
      </div>
      <h1 className="mt-3 font-display text-2xl">{produto.nome}</h1>
      <div className="mt-6">
        <FormularioProduto
          produtoId={produto.id}
          categorias={categorias}
          inicial={{
            nome: produto.nome,
            slug: produto.slug,
            resumo: produto.resumo,
            descricao: produto.descricao,
            marca: produto.marca ?? "",
            categoriaId: produto.categoriaId,
            precoCentavos: produto.precoCentavos,
            precoPromocionalCentavos: produto.precoPromocionalCentavos,
            ativo: produto.ativo,
            destaque: produto.destaque,
            lancamento: produto.lancamento,
            imagens: produto.imagens.map((i) => ({ url: i.url, alt: i.alt })),
            variantes: produto.variantes.map((v) => ({
              id: v.id,
              tamanho: v.tamanho,
              cor: v.cor,
              corHex: v.corHex,
              estoque: v.estoque,
              ativo: v.ativo,
            })),
          }}
        />
      </div>
    </div>
  );
}
