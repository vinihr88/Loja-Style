import type { Metadata } from "next";
import { PainelCarrinho } from "@/components/carrinho/painel-carrinho";

export const metadata: Metadata = {
  title: "Sacola",
  robots: { index: false, follow: false },
};

export default function PaginaCarrinho() {
  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl">Sua sacola</h1>
      <PainelCarrinho />
    </div>
  );
}
