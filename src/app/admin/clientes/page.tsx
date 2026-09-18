import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { data, moeda } from "@/lib/formato";

export default async function PaginaClientes({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const { busca = "" } = await searchParams;

  const clientes = await prisma.usuario.findMany({
    where: busca ? { OR: [{ nome: { contains: busca } }, { email: { contains: busca.toLowerCase() } }] } : undefined,
    orderBy: { criadoEm: "desc" },
    take: 200,
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      admin: true,
      criadoEm: true,
      pedidos: { where: { status: { notIn: ["AGUARDANDO_PAGAMENTO", "CANCELADO"] } }, select: { totalCentavos: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">Clientes</h1>
      <form method="get" className="mt-5 flex max-w-sm gap-2">
        <input name="busca" defaultValue={busca} placeholder="nome ou e-mail" className="campo py-1.5 text-sm" />
        <button type="submit" className="botao botao-contorno py-1.5">
          Buscar
        </button>
      </form>

      <div className="mt-5 overflow-x-auto border border-ardosia-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Telefone</th>
              <th className="px-4 py-3 font-semibold">Desde</th>
              <th className="px-4 py-3 font-semibold">Pedidos pagos</th>
              <th className="px-4 py-3 text-right font-semibold">Total gasto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardosia-200">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-areia-50">
                <td className="px-4 py-3">
                  {c.nome}
                  {c.admin && <span className="etiqueta ml-2 bg-ouro-500 text-ardosia-900">admin</span>}
                  <p className="text-xs text-ardosia-400">
                    <Link href={`/admin/pedidos?busca=${encodeURIComponent(c.email)}`} className="underline-offset-2 hover:underline">
                      {c.email}
                    </Link>
                  </p>
                </td>
                <td className="px-4 py-3 text-ardosia-600">{c.telefone ?? "—"}</td>
                <td className="px-4 py-3 text-ardosia-600">{data(c.criadoEm)}</td>
                <td className="px-4 py-3">{c.pedidos.length}</td>
                <td className="px-4 py-3 text-right font-semibold">{moeda(c.pedidos.reduce((s, p) => s + p.totalCentavos, 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
