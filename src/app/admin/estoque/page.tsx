import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CampoEstoque } from "@/components/admin/campo-estoque";

export default async function PaginaEstoque({ searchParams }: { searchParams: Promise<{ baixo?: string }> }) {
  const { baixo } = await searchParams;

  const variantes = await prisma.variante.findMany({
    where: { ativo: true, produto: { ativo: true }, ...(baixo ? { estoque: { lte: 2 } } : {}) },
    orderBy: [{ produto: { nome: "asc" } }, { cor: "asc" }, { tamanho: "asc" }],
    include: { produto: { select: { id: true, nome: true } } },
  });

  const total = variantes.reduce((s, v) => s + v.estoque, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Estoque</h1>
          <p className="mt-1 text-sm text-ardosia-500">
            {variantes.length} variações · {total} peças. Edite e saia do campo para salvar.
          </p>
        </div>
        <div className="flex gap-1.5">
          <Link href="/admin/estoque" className={`border px-3 py-1.5 text-xs font-medium ${!baixo ? "border-ardosia-900 bg-ardosia-900 text-areia-50" : "border-ardosia-200 bg-white"}`}>
            Todas
          </Link>
          <Link href="/admin/estoque?baixo=1" className={`border px-3 py-1.5 text-xs font-medium ${baixo ? "border-ardosia-900 bg-ardosia-900 text-areia-50" : "border-ardosia-200 bg-white"}`}>
            Só estoque baixo
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto border border-ardosia-200 bg-white">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Peça</th>
              <th className="px-4 py-3 font-semibold">Cor</th>
              <th className="px-4 py-3 font-semibold">Tamanho</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Estoque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardosia-200">
            {variantes.map((v) => (
              <tr key={v.id} className="hover:bg-areia-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/produtos/${v.produto.id}`} className="underline-offset-4 hover:underline">
                    {v.produto.nome}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span className="mr-2 inline-block h-3 w-3 rounded-full border border-ardosia-300 align-middle" style={{ backgroundColor: v.corHex }} />
                  {v.cor}
                </td>
                <td className="px-4 py-2">{v.tamanho}</td>
                <td className="px-4 py-2 font-mono text-xs text-ardosia-500">{v.sku}</td>
                <td className="px-4 py-2">
                  <CampoEstoque varianteId={v.id} inicial={v.estoque} />
                </td>
              </tr>
            ))}
            {variantes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ardosia-500">
                  Nada por aqui.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
