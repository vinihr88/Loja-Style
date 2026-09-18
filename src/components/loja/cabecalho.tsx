"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarrinho } from "@/components/carrinho/contexto";
import { IconeBusca, IconeFechar, IconeMenu, IconeSacola, IconeUsuario } from "@/components/ui/icones";

type Categoria = { nome: string; slug: string };

export function Cabecalho({
  categorias,
  usuario,
}: {
  categorias: Categoria[];
  usuario: { nome: string; admin: boolean } | null;
}) {
  const { quantidadeTotal, pronto } = useCarrinho();
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const router = useRouter();
  const parametros = useSearchParams();

  useEffect(() => {
    setTermo(parametros.get("busca") ?? "");
  }, [parametros]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  function buscar(evento: React.FormEvent) {
    evento.preventDefault();
    const valor = termo.trim();
    router.push(valor ? `/produtos?busca=${encodeURIComponent(valor)}` : "/produtos");
    setBuscaAberta(false);
    setMenuAberto(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ardosia-200 bg-areia-50/95 backdrop-blur">
      <p className="bg-ardosia-900 py-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-areia-100">
        Frete grátis acima de R$ 399 · Troca de tamanho por nossa conta
      </p>

      <div className="container-loja flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="-ml-2 p-2 md:hidden"
          aria-label="Abrir menu"
        >
          <IconeMenu className="h-6 w-6" />
        </button>

        <Link href="/" className="font-display text-lg tracking-[0.3em] text-ardosia-900">
          KAUÃ
          <span className="text-ouro-600">.</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/produtos" className="text-sm text-ardosia-600 transition-colors hover:text-ardosia-900">
            Todas as peças
          </Link>
          {categorias.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/produtos?categoria=${c.slug}`}
              className="text-sm text-ardosia-600 transition-colors hover:text-ardosia-900"
            >
              {c.nome}
            </Link>
          ))}
          <Link href="/colecoes" className="text-sm text-ardosia-600 transition-colors hover:text-ardosia-900">
            Coleções
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setBuscaAberta((v) => !v)}
            className="p-2 text-ardosia-700 hover:text-ardosia-900"
            aria-label="Buscar"
            aria-expanded={buscaAberta}
          >
            <IconeBusca className="h-5 w-5" />
          </button>

          <Link
            href={usuario ? (usuario.admin ? "/admin" : "/conta") : "/entrar"}
            className="hidden p-2 text-ardosia-700 hover:text-ardosia-900 sm:block"
            aria-label={usuario ? "Minha conta" : "Entrar"}
          >
            <IconeUsuario className="h-5 w-5" />
          </Link>

          <Link href="/carrinho" className="relative p-2 text-ardosia-700 hover:text-ardosia-900" aria-label="Carrinho">
            <IconeSacola className="h-5 w-5" />
            {pronto && quantidadeTotal > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ouro-500 px-1 text-[0.625rem] font-bold text-ardosia-900">
                {quantidadeTotal}
              </span>
            )}
          </Link>
        </div>
      </div>

      {buscaAberta && (
        <div className="border-t border-ardosia-200 bg-white">
          <form onSubmit={buscar} className="container-loja flex gap-2 py-3">
            <input
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar por peça, marca ou categoria"
              className="campo"
              aria-label="Termo de busca"
            />
            <button type="submit" className="botao botao-principal">
              Buscar
            </button>
          </form>
        </div>
      )}

      {menuAberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ardosia-900/40"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-areia-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-ardosia-200 px-5 py-4">
              <span className="font-display tracking-[0.25em]">MENU</span>
              <button type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
                <IconeFechar className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-4">
              <Link href="/produtos" onClick={() => setMenuAberto(false)} className="block py-2.5 text-base">
                Todas as peças
              </Link>
              {categorias.map((c) => (
                <Link
                  key={c.slug}
                  href={`/produtos?categoria=${c.slug}`}
                  onClick={() => setMenuAberto(false)}
                  className="block py-2.5 text-base text-ardosia-700"
                >
                  {c.nome}
                </Link>
              ))}
              <div className="my-4 border-t border-ardosia-200" />
              <Link href="/colecoes" onClick={() => setMenuAberto(false)} className="block py-2.5 text-ardosia-700">
                Coleções
              </Link>
              <Link href="/rastreio" onClick={() => setMenuAberto(false)} className="block py-2.5 text-ardosia-700">
                Rastrear pedido
              </Link>
              <Link href="/suporte" onClick={() => setMenuAberto(false)} className="block py-2.5 text-ardosia-700">
                Suporte
              </Link>
              <Link
                href={usuario ? (usuario.admin ? "/admin" : "/conta") : "/entrar"}
                onClick={() => setMenuAberto(false)}
                className="block py-2.5 text-ardosia-700"
              >
                {usuario ? (usuario.admin ? "Painel" : "Minha conta") : "Entrar"}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
