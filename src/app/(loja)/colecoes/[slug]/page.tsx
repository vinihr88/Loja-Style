import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listarProdutos } from "@/lib/consultas";
import { CartaoProduto } from "@/components/produto/cartao-produto";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const colecao = await prisma.colecao.findUnique({ where: { slug } });
  if (!colecao) return { title: "Coleção não encontrada" };
  return { title: colecao.nome, description: colecao.descricao ?? undefined };
}

export default async function PaginaColecao({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const colecao = await prisma.colecao.findUnique({ where: { slug } });
  if (!colecao) notFound();

  const { produtos } = await listarProdutos({ colecao: slug, porPagina: 48 });

  return (
    <div className="container-loja py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ardosia-500">
        <Link href="/colecoes" className="hover:text-ardosia-900">
          Coleções
        </Link>
        <span>/</span>
        <span className="text-ardosia-700">{colecao.nome}</span>
      </nav>

      <h1 className="font-display text-3xl sm:text-4xl">{colecao.nome}</h1>
      {colecao.descricao && <p className="mt-2 max-w-lg text-sm text-ardosia-500">{colecao.descricao}</p>}

      {produtos.length === 0 ? (
        <p className="mt-10 text-sm text-ardosia-500">Nenhuma peça ativa nesta coleção no momento.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p, i) => (
            <CartaoProduto key={p.id} produto={p} prioridade={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
