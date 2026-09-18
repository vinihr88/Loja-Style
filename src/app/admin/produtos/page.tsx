import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { moeda } from "@/lib/formato";

export default async function PaginaProdutosAdmin({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const { busca = "" } = await searchParams;

  const produtos = await prisma.produto.findMany({
    where: busca ? { OR: [{ nome: { contains: busca } }, { slug: { contains: busca } }, { marca: { contains: busca } }] } : undefined,
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      categoria: { select: { nome: true } },
      imagens: { take: 1, orderBy: { ordem: "asc" } },
      variantes: { select: { estoque: true, ativo: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Produtos</h1>
        <Link href="/admin/produtos/novo" className="botao botao-principal py-2.5">
          Nova peça
        </Link>
      </div>

      <form method="get" className="mt-5 flex max-w-sm gap-2">
        <input name="busca" defaultValue={busca} placeholder="nome, slug ou marca" className="campo py-1.5 text-sm" />
        <button type="submit" className="botao botao-contorno py-1.5">
          Buscar
        </button>
      </form>

      <div className="mt-5 overflow-x-auto border border-ardosia-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Peça</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Preço</th>
              <th className="px-4 py-3 font-semibold">Estoque</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardosia-200">
            {produtos.map((p) => {
              const estoque = p.variantes.filter((v) => v.ativo).reduce((s, v) => s + v.estoque, 0);
              return (
                <tr key={p.id} className="hover:bg-areia-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3">
                      <span className="relative block aspect-3/4 w-10 shrink-0 bg-ardosia-100">
                        {p.imagens[0] && <Image src={p.imagens[0].url} alt="" fill sizes="40px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="block font-medium underline-offset-4 hover:underline">{p.nome}</span>
                        <span className="block text-xs text-ardosia-400">{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ardosia-600">{p.categoria.nome}</td>
                  <td className="px-4 py-3">
                    {p.precoPromocionalCentavos ? (
                      <>
                        <span className="font-semibold">{moeda(p.precoPromocionalCentavos)}</span>
                        <span className="ml-1.5 text-xs text-ardosia-400 line-through">{moeda(p.precoCentavos)}</span>
                      </>
                    ) : (
                      <span className="font-semibold">{moeda(p.precoCentavos)}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${estoque <= 3 ? "font-semibold text-red-700" : ""}`}>{estoque}</td>
                  <td className="px-4 py-3">
                    <span className={`etiqueta border ${p.ativo ? "border-green-200 bg-green-50 text-green-800" : "border-ardosia-200 bg-ardosia-100 text-ardosia-600"}`}>
                      {p.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
