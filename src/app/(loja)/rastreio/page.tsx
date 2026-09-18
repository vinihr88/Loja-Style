import type { Metadata } from "next";
import { pedidoPorNumeroEEmail } from "@/lib/pedidos";
import { DetalhePedido } from "@/components/pedido/detalhe-pedido";

export const metadata: Metadata = {
  title: "Rastrear pedido",
  description: "Acompanhe o andamento do seu pedido pelo número e e-mail da compra.",
};

export default async function PaginaRastreio({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string; email?: string }>;
}) {
  const { numero = "", email = "" } = await searchParams;
  const consultou = numero.trim() !== "" && email.trim() !== "";
  const pedido = consultou ? await pedidoPorNumeroEEmail(numero, email) : null;

  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl">Rastrear pedido</h1>
      <p className="mt-2 text-sm text-ardosia-500">Use o número do pedido e o e-mail da compra.</p>

      <form method="get" className="mt-6 grid max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="numero" className="rotulo">
            Número do pedido
          </label>
          <input id="numero" name="numero" defaultValue={numero} placeholder="KS2609123456" required className="campo uppercase" />
        </div>
        <div>
          <label htmlFor="email" className="rotulo">
            E-mail
          </label>
          <input id="email" name="email" type="email" defaultValue={email} required className="campo" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="botao botao-principal w-full">
            Consultar
          </button>
        </div>
      </form>

      {consultou && !pedido && (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Não encontramos pedido com este número e e-mail. Confira os dados e tente de novo.
        </p>
      )}

      {pedido && (
        <div className="mt-10 border-t border-ardosia-200 pt-10">
          <DetalhePedido pedido={pedido} />
        </div>
      )}
    </div>
  );
}
