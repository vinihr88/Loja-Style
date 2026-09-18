import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROTULO_STATUS, STATUS_PEDIDO } from "@/lib/constantes";
import { dataHora, moeda } from "@/lib/formato";
import { corDoStatus } from "@/components/pedido/detalhe-pedido";

export default async function PaginaAdmin() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const pagos = { status: { in: [STATUS_PEDIDO.PAGO, STATUS_PEDIDO.EM_SEPARACAO, STATUS_PEDIDO.ENVIADO, STATUS_PEDIDO.ENTREGUE] } };

  const [receitaMes, pedidosMes, aguardando, paraEnviar, estoqueBaixo, recentes, maisVendidos] = await Promise.all([
    prisma.pedido.aggregate({ where: { ...pagos, pagoEm: { gte: inicioMes } }, _sum: { totalCentavos: true } }),
    prisma.pedido.count({ where: { ...pagos, pagoEm: { gte: inicioMes } } }),
    prisma.pedido.count({ where: { status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO } }),
    prisma.pedido.count({ where: { status: { in: [STATUS_PEDIDO.PAGO, STATUS_PEDIDO.EM_SEPARACAO] } } }),
    prisma.variante.count({ where: { ativo: true, estoque: { lte: 2 }, produto: { ativo: true } } }),
    prisma.pedido.findMany({ orderBy: { criadoEm: "desc" }, take: 8 }),
    prisma.itemPedido.groupBy({
      by: ["produtoNome", "produtoSlug"],
      where: { pedido: pagos },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: "desc" } },
      take: 5,
    }),
  ]);

  const cartoes = [
    { rotulo: "Receita no mês", valor: moeda(receitaMes._sum.totalCentavos ?? 0), nota: `${pedidosMes} pedidos pagos` },
    { rotulo: "Aguardando pagamento", valor: String(aguardando), nota: "pedidos pendentes", href: "/admin/pedidos?status=AGUARDANDO_PAGAMENTO" },
    { rotulo: "Para enviar", valor: String(paraEnviar), nota: "pagos ou em separação", href: "/admin/pedidos?status=PAGO" },
    { rotulo: "Estoque baixo", valor: String(estoqueBaixo), nota: "variantes com até 2 peças", href: "/admin/estoque" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl">Visão geral</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map((c) => {
          const conteudo = (
            <>
              <p className="text-xs uppercase tracking-[0.12em] text-ardosia-500">{c.rotulo}</p>
              <p className="mt-2 font-display text-2xl">{c.valor}</p>
              <p className="text-xs text-ardosia-400">{c.nota}</p>
            </>
          );
          return c.href ? (
            <Link key={c.rotulo} href={c.href} className="border border-ardosia-200 bg-white p-5 transition-colors hover:border-ardosia-900">
              {conteudo}
            </Link>
          ) : (
            <div key={c.rotulo} className="border border-ardosia-200 bg-white p-5">
              {conteudo}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_20rem]">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-ardosia-600 underline underline-offset-4">
              ver todos
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto border border-ardosia-200 bg-white">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ardosia-200">
                {recentes.map((p) => (
                  <tr key={p.id} className="hover:bg-areia-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${p.id}`} className="font-mono underline-offset-4 hover:underline">
                        {p.numero}
                      </Link>
                      <p className="text-xs text-ardosia-400">{dataHora(p.criadoEm)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {p.nome}
                      <p className="text-xs text-ardosia-400">{p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`etiqueta border ${corDoStatus(p.status)}`}>{ROTULO_STATUS[p.status] ?? p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{moeda(p.totalCentavos)}</td>
                  </tr>
                ))}
                {recentes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ardosia-500">
                      Nenhum pedido ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg">Mais vendidos</h2>
          <ol className="mt-4 space-y-2 border border-ardosia-200 bg-white p-5 text-sm">
            {maisVendidos.length === 0 && <li className="text-ardosia-500">Sem vendas confirmadas ainda.</li>}
            {maisVendidos.map((m, i) => (
              <li key={m.produtoSlug} className="flex justify-between gap-3">
                <span>
                  <span className="mr-2 text-ardosia-400">{i + 1}.</span>
                  {m.produtoNome}
                </span>
                <span className="font-semibold">{m._sum.quantidade}un</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
