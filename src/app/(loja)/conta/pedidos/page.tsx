import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { ROTULO_STATUS } from "@/lib/constantes";
import { data, moeda } from "@/lib/formato";
import { corDoStatus } from "@/components/pedido/detalhe-pedido";

export default async function PaginaPedidosConta() {
  const usuario = await exigirUsuario();

  const pedidos = await prisma.pedido.findMany({
    where: { OR: [{ usuarioId: usuario.id }, { email: usuario.email }] },
    orderBy: { criadoEm: "desc" },
    include: { itens: { select: { produtoNome: true, quantidade: true } } },
  });

  return (
    <div>
      <h2 className="font-display text-xl">Seus pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="mt-5 border border-dashed border-ardosia-300 px-6 py-14 text-center">
          <p className="text-sm text-ardosia-500">Você ainda não fez nenhum pedido.</p>
          <Link href="/produtos" className="botao botao-principal mt-5">
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-ardosia-200 border-y border-ardosia-200">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link href={`/pedido/${p.numero}`} className="flex flex-wrap items-center justify-between gap-4 py-4 hover:bg-areia-100">
                <div>
                  <p className="font-mono text-sm">{p.numero}</p>
                  <p className="mt-0.5 text-xs text-ardosia-500">
                    {data(p.criadoEm)} · {p.itens.reduce((s, i) => s + i.quantidade, 0)} peça(s)
                  </p>
                  <p className="mt-1 text-xs text-ardosia-600">{p.itens.map((i) => i.produtoNome).join(", ")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`etiqueta border ${corDoStatus(p.status)}`}>{ROTULO_STATUS[p.status] ?? p.status}</span>
                  <span className="text-sm font-semibold">{moeda(p.totalCentavos)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
