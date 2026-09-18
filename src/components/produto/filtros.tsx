"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { moeda } from "@/lib/formato";
import { IconeFechar } from "@/components/ui/icones";

export type Facetas = {
  categorias: { nome: string; slug: string; _count: { produtos: number } }[];
  tamanhos: string[];
  cores: { nome: string; hex: string }[];
  precoMin: number;
  precoMax: number;
};

const ORDENS = [
  { valor: "relevancia", rotulo: "Mais relevantes" },
  { valor: "novidades", rotulo: "Novidades" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
];

export function Filtros({ facetas, total }: { facetas: Facetas; total: number }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [aberto, setAberto] = useState(false);

  const selecionados = {
    categoria: parametros.get("categoria") ?? "",
    tamanhos: parametros.getAll("tamanho"),
    cores: parametros.getAll("cor"),
    promocao: parametros.get("promocao") === "1",
    disponivel: parametros.get("disponivel") === "1",
    ordem: parametros.get("ordem") ?? "relevancia",
  };

  const ativos =
    (selecionados.categoria ? 1 : 0) +
    selecionados.tamanhos.length +
    selecionados.cores.length +
    (selecionados.promocao ? 1 : 0) +
    (selecionados.disponivel ? 1 : 0);

  function aplicar(mudanca: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(parametros.toString());
    mudanca(p);
    p.delete("pagina");
    router.push(`/produtos?${p.toString()}`, { scroll: false });
  }

  function alternarLista(chave: string, valor: string) {
    aplicar((p) => {
      const atuais = p.getAll(chave);
      p.delete(chave);
      const novos = atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor];
      for (const v of novos) p.append(chave, v);
    });
  }

  function definir(chave: string, valor: string | null) {
    aplicar((p) => {
      if (valor === null || valor === "") p.delete(chave);
      else p.set(chave, valor);
    });
  }

  const painel = (
    <div className="space-y-7">
      <section>
        <h3 className="rotulo">Categoria</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => definir("categoria", null)}
              className={`text-sm transition-colors ${
                selecionados.categoria === "" ? "font-semibold text-ardosia-900" : "text-ardosia-600 hover:text-ardosia-900"
              }`}
            >
              Todas
            </button>
          </li>
          {facetas.categorias.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => definir("categoria", c.slug)}
                className={`text-sm transition-colors ${
                  selecionados.categoria === c.slug
                    ? "font-semibold text-ardosia-900"
                    : "text-ardosia-600 hover:text-ardosia-900"
                }`}
              >
                {c.nome}
                <span className="ml-1.5 text-xs text-ardosia-400">{c._count.produtos}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="rotulo">Tamanho</h3>
        <div className="flex flex-wrap gap-1.5">
          {facetas.tamanhos.map((t) => {
            const ativo = selecionados.tamanhos.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => alternarLista("tamanho", t)}
                aria-pressed={ativo}
                className={`min-w-10 border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  ativo
                    ? "border-ardosia-900 bg-ardosia-900 text-areia-50"
                    : "border-ardosia-200 text-ardosia-700 hover:border-ardosia-500"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="rotulo">Cor</h3>
        <div className="flex flex-wrap gap-2">
          {facetas.cores.map((c) => {
            const ativo = selecionados.cores.includes(c.nome);
            return (
              <button
                key={c.nome}
                type="button"
                title={c.nome}
                aria-label={c.nome}
                aria-pressed={ativo}
                onClick={() => alternarLista("cor", c.nome)}
                className={`h-7 w-7 rounded-full border-2 transition-colors ${
                  ativo ? "border-ouro-600" : "border-ardosia-200 hover:border-ardosia-400"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-2.5">
        <h3 className="rotulo">Filtros rápidos</h3>
        <label className="flex items-center gap-2 text-sm text-ardosia-700">
          <input
            type="checkbox"
            checked={selecionados.promocao}
            onChange={() => definir("promocao", selecionados.promocao ? null : "1")}
            className="h-4 w-4 accent-ardosia-900"
          />
          Só com preço reduzido
        </label>
        <label className="flex items-center gap-2 text-sm text-ardosia-700">
          <input
            type="checkbox"
            checked={selecionados.disponivel}
            onChange={() => definir("disponivel", selecionados.disponivel ? null : "1")}
            className="h-4 w-4 accent-ardosia-900"
          />
          Só disponíveis
        </label>
      </section>

      <p className="text-xs text-ardosia-400">
        Preços de {moeda(facetas.precoMin)} a {moeda(facetas.precoMax)}
      </p>

      {ativos > 0 && (
        <button
          type="button"
          onClick={() => router.push("/produtos", { scroll: false })}
          className="text-sm text-ardosia-900 underline underline-offset-4"
        >
          Limpar filtros ({ativos})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-ardosia-200 pb-4 lg:mb-0 lg:border-0 lg:pb-0">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="botao botao-contorno py-2.5 lg:hidden"
        >
          Filtrar{ativos > 0 ? ` (${ativos})` : ""}
        </button>

        <p className="hidden text-sm text-ardosia-500 lg:block">{total} peças</p>

        <div className="flex items-center gap-2 lg:hidden">
          <label htmlFor="ordem-mobile" className="sr-only">
            Ordenar por
          </label>
          <select
            id="ordem-mobile"
            value={selecionados.ordem}
            onChange={(e) => definir("ordem", e.target.value)}
            className="border border-ardosia-200 bg-white px-2 py-2 text-sm"
          >
            {ORDENS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="mb-6">
          <label htmlFor="ordem" className="rotulo">
            Ordenar por
          </label>
          <select
            id="ordem"
            value={selecionados.ordem}
            onChange={(e) => definir("ordem", e.target.value)}
            className="campo"
          >
            {ORDENS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>
        {painel}
      </div>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ardosia-900/40"
            onClick={() => setAberto(false)}
            aria-label="Fechar filtros"
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-areia-50">
            <div className="flex items-center justify-between border-b border-ardosia-200 px-5 py-4">
              <span className="font-display tracking-[0.2em]">FILTROS</span>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar filtros">
                <IconeFechar className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{painel}</div>
            <div className="border-t border-ardosia-200 p-4">
              <button type="button" onClick={() => setAberto(false)} className="botao botao-principal w-full">
                Ver {total} peças
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
