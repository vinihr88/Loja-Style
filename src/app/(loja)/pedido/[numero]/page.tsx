import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pedidosLembrados, usuarioAtual } from "@/lib/auth";
import { DetalhePedido } from "@/components/pedido/detalhe-pedido";

export const metadata: Metadata = { title: "Seu pedido", robots: { index: false, follow: false } };

// Quem vê: dono logado, quem informa o e-mail da compra, ou o navegador que fez
// o checkout (cookie assinado). Só o número não basta.
export default async function PaginaPedido({
  params,
  searchParams,
}: {
  params: Promise<{ numero: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { numero } = await params;
  const { email } = await searchParams;

  const pedido = await prisma.pedido.findUnique({
    where: { numero: numero.toUpperCase() },
    include: { itens: true, eventos: { orderBy: { criadoEm: "asc" } } },
  });
  if (!pedido) notFound();

  const [usuario, lembrados] = await Promise.all([usuarioAtual(), pedidosLembrados()]);
  const dono = usuario && (usuario.admin || pedido.usuarioId === usuario.id);
  const emailConfere = email && email.trim().toLowerCase() === pedido.email;
  const compradorNesteNavegador = lembrados.includes(pedido.numero);

  if (!dono && !emailConfere && !compradorNesteNavegador) {
    return (
      <div className="container-loja py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl">Consultar pedido</h1>
          <p className="mt-3 text-sm text-ardosia-600">
            Para ver este pedido, informe o e-mail usado na compra em{" "}
            <Link href={`/rastreio?numero=${pedido.numero}`} className="underline underline-offset-4">
              rastrear pedido
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-loja py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-ouro-600">Obrigado pela compra</p>
        <h1 className="mt-2 font-display text-3xl">Pedido {pedido.numero}</h1>
        <p className="mt-2 text-sm text-ardosia-500">
          Guardamos os detalhes em {pedido.email}. Você acompanha tudo por aqui.
        </p>
      </div>
      <DetalhePedido pedido={pedido} />
    </div>
  );
}
