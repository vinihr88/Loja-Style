"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconeFechar, IconeMenu } from "@/components/ui/icones";

const LINKS = [
  { href: "/admin", rotulo: "Visão geral", chave: "" },
  { href: "/admin/pedidos", rotulo: "Pedidos", chave: "pedidos" },
  { href: "/admin/produtos", rotulo: "Produtos", chave: "" },
  { href: "/admin/estoque", rotulo: "Estoque", chave: "" },
  { href: "/admin/cupons", rotulo: "Cupons", chave: "" },
  { href: "/admin/clientes", rotulo: "Clientes", chave: "" },
  { href: "/admin/avaliacoes", rotulo: "Avaliações", chave: "avaliacoes" },
  { href: "/admin/mensagens", rotulo: "Mensagens", chave: "mensagens" },
];

export function MenuAdmin({
  contadores,
  nome,
}: {
  contadores: Record<string, number>;
  nome: string;
}) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  const lista = (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map((l) => {
        const ativo = l.href === "/admin" ? caminho === "/admin" : caminho.startsWith(l.href);
        const contador = l.chave ? contadores[l.chave] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setAberto(false)}
            className={`flex items-center justify-between px-3 py-2 text-sm transition-colors ${
              ativo ? "bg-ardosia-800 text-areia-50" : "text-ardosia-300 hover:bg-ardosia-800/60 hover:text-areia-50"
            }`}
          >
            {l.rotulo}
            {contador > 0 && (
              <span className="rounded-full bg-ouro-500 px-1.5 text-[0.625rem] font-bold text-ardosia-900">{contador}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col bg-ardosia-900 px-3 py-6 lg:flex">
        <Link href="/admin" className="px-3 font-display text-lg tracking-[0.3em] text-areia-50">
          KAUÃ<span className="text-ouro-500">.</span>
        </Link>
        <p className="mt-1 px-3 text-[0.625rem] uppercase tracking-[0.2em] text-ardosia-400">Painel</p>
        <div className="mt-8">{lista}</div>
        <p className="mt-auto px-3 text-xs text-ardosia-400">{nome}</p>
      </aside>

      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ardosia-900 text-areia-50 shadow-lg lg:hidden"
        aria-label="Abrir menu do painel"
      >
        <IconeMenu className="h-5 w-5" />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ardosia-900/50" onClick={() => setAberto(false)} aria-label="Fechar menu" />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ardosia-900 px-3 py-6">
            <div className="flex items-center justify-between px-3">
              <span className="font-display tracking-[0.3em] text-areia-50">KAUÃ.</span>
              <button type="button" onClick={() => setAberto(false)} className="text-areia-50" aria-label="Fechar menu">
                <IconeFechar className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8">{lista}</div>
          </div>
        </div>
      )}
    </>
  );
}
