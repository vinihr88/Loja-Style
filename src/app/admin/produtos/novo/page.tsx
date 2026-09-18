import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FormularioProduto } from "@/components/admin/formulario-produto";

export default async function PaginaNovoProduto() {
  const categorias = await prisma.categoria.findMany({ orderBy: { ordem: "asc" }, select: { id: true, nome: true } });

  return (
    <div>
      <Link href="/admin/produtos" className="text-sm text-ardosia-600 underline underline-offset-4">
        ← produtos
      </Link>
      <h1 className="mt-3 font-display text-2xl">Nova peça</h1>
      <div className="mt-6">
        <FormularioProduto
          categorias={categorias}
          inicial={{
            nome: "",
            slug: "",
            resumo: "",
            descricao: "",
            marca: "",
            categoriaId: categorias[0]?.id ?? "",
            precoCentavos: 0,
            precoPromocionalCentavos: null,
            ativo: true,
            destaque: false,
            lancamento: true,
            imagens: [],
            variantes: [
              { tamanho: "P", cor: "Preto", corHex: "#141414", estoque: 0, ativo: true },
              { tamanho: "M", cor: "Preto", corHex: "#141414", estoque: 0, ativo: true },
              { tamanho: "G", cor: "Preto", corHex: "#141414", estoque: 0, ativo: true },
            ],
          }}
        />
      </div>
    </div>
  );
}
