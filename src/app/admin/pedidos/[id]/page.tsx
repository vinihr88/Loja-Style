import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DetalhePedido } from "@/components/pedido/detalhe-pedido";
import { AlterarStatus } from "@/components/admin/alterar-status";
import { WHATSAPP } from "@/lib/constantes";

export default async function PaginaPedidoAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { itens: true, eventos: { orderBy: { criadoEm: "asc" } } },
  });
  if (!pedido) notFound();

  const telefone = pedido.telefone.replace(/\D/g, "");

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-ardosia-600 underline underline-offset-4">
        ← pedidos
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl">
          Pedido <span className="font-mono">{pedido.numero}</span>
        </h1>
        <div className="flex gap-4 text-sm">
          <a href={`mailto:${pedido.email}`} className="text-ardosia-600 underline underline-offset-4">
            {pedido.email}
          </a>
          {telefone && (
            <a href={`https://wa.me/55${telefone}`} target="_blank" rel="noopener noreferrer" className="text-ardosia-600 underline underline-offset-4">
              WhatsApp do cliente
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_22rem]">
        <DetalhePedido pedido={pedido} modoAdmin />
        <div className="space-y-4">
          <AlterarStatus pedidoId={pedido.id} statusAtual={pedido.status} rastreioAtual={pedido.rastreioCodigo} />
          <div className="border border-ardosia-200 bg-white p-5 text-xs text-ardosia-500">
            <p>CPF: {pedido.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
            <p className="mt-1">Telefone: {pedido.telefone}</p>
            {pedido.pagamentoId && <p className="mt-1">Gateway: {pedido.pagamentoId}</p>}
            {pedido.pagamentoStatus && <p className="mt-1">Status no gateway: {pedido.pagamentoStatus}</p>}
            {!WHATSAPP && <p className="mt-2 text-amber-700">NEXT_PUBLIC_WHATSAPP vazio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
