import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROTULO_STATUS, STATUS_PEDIDO } from "@/lib/constantes";
import { dataHora, moeda } from "@/lib/formato";
import { corDoStatus } from "@/components/pedido/detalhe-pedido";

const FILTROS = ["", ...Object.values(STATUS_PEDIDO)];

export default async function PaginaPedidosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  const { status = "", busca = "" } = await searchParams;

  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(busca
        ? { OR: [{ numero: { contains: busca.toUpperCase() } }, { email: { contains: busca.toLowerCase() } }, { nome: { contains: busca } }] }
        : {}),
    },
    orderBy: { criadoEm: "desc" },
    take: 100,
    include: { _count: { select: { itens: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">Pedidos</h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <Link
              key={f}
              href={f ? `/admin/pedidos?status=${f}` : "/admin/pedidos"}
              className={`border px-3 py-1.5 text-xs font-medium ${
                status === f ? "border-ardosia-900 bg-ardosia-900 text-areia-50" : "border-ardosia-200 bg-white text-ardosia-700 hover:border-ardosia-500"
              }`}
            >
              {f ? ROTULO_STATUS[f] : "Todos"}
            </Link>
          ))}
        </div>
        <form method="get" className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="busca" defaultValue={busca} placeholder="número, e-mail ou nome" className="campo w-56 py-1.5 text-sm" />
          <button type="submit" className="botao botao-contorno py-1.5">
            Buscar
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-x-auto border border-ardosia-200 bg-white">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Pedido</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Peças</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Pagamento</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardosia-200">
            {pedidos.map((p) => (
              <tr key={p.id} className="hover:bg-areia-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${p.id}`} className="font-mono underline-offset-4 hover:underline">
                    {p.numero}
                  </Link>
                  <p className="text-xs text-ardosia-400">{dataHora(p.criadoEm)}</p>
                </td>
                <td className="px-4 py-3">
                  {p.nome}
                  <p className="text-xs text-ardosia-400">
                    {p.cidade}/{p.uf}
                  </p>
                </td>
                <td className="px-4 py-3">{p._count.itens}</td>
                <td className="px-4 py-3">
                  <span className={`etiqueta border ${corDoStatus(p.status)}`}>{ROTULO_STATUS[p.status] ?? p.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-ardosia-500">{p.pagamentoMetodo ?? p.pagamentoStatus ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold">{moeda(p.totalCentavos)}</td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ardosia-500">
                  Nenhum pedido com este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
