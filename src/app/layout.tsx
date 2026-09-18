import type { Metadata } from "next";
import { SITE_URL, NOME_LOJA } from "@/lib/constantes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NOME_LOJA} — streetwear de grife`,
    template: `%s · ${NOME_LOJA}`,
  },
  description:
    "Conjuntos, camisetas, jaquetas e acessórios selecionados peça a peça. Envio para todo o Brasil e frete grátis acima de R$ 399.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: NOME_LOJA,
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
