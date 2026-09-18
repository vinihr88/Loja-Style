import type { Metadata } from "next";
import { usuarioAtual } from "@/lib/auth";
import { gatewayConfigurado } from "@/lib/mercadopago";
import { FormularioCheckout } from "@/components/checkout/formulario-checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function PaginaCheckout() {
  const usuario = await usuarioAtual();

  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl">Finalizar compra</h1>
      <FormularioCheckout
        usuario={usuario ? { nome: usuario.nome, email: usuario.email, telefone: usuario.telefone } : null}
        gatewayLigado={gatewayConfigurado()}
      />
    </div>
  );
}
