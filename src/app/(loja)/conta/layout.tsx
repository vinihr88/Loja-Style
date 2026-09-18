import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { BotaoSair } from "@/components/conta/botao-sair";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false, follow: false } };

const LINKS = [
  { href: "/conta", rotulo: "Dados" },
  { href: "/conta/pedidos", rotulo: "Pedidos" },
  { href: "/conta/enderecos", rotulo: "Endereços" },
  { href: "/conta/favoritos", rotulo: "Favoritos" },
];

export default async function LayoutConta({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  return (
    <div className="container-loja py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ouro-600">Minha conta</p>
          <h1 className="mt-1 font-display text-3xl">Olá, {usuario.nome.split(" ")[0]}</h1>
        </div>
        <div className="flex items-center gap-4">
          {usuario.admin && (
            <Link href="/admin" className="text-sm text-ardosia-900 underline underline-offset-4">
              Painel
            </Link>
          )}
          <BotaoSair />
        </div>
      </div>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-ardosia-200">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-ardosia-600 hover:border-ardosia-900 hover:text-ardosia-900">
            {l.rotulo}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
