"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCarrinho } from "@/components/carrinho/contexto";
import { mascaraCep, moeda } from "@/lib/formato";
import { IconeFechar, IconeSacola } from "@/components/ui/icones";

type OpcaoFrete = { metodo: string; nome: string; precoCentavos: number; prazoDias: number; descricao: string };

export function PainelCarrinho() {
  const { itens, pronto, subtotalCentavos, alterarQuantidade, remover } = useCarrinho();
  const [cep, setCep] = useState("");
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erroFrete, setErroFrete] = useState("");

  async function calcularFrete(evento: React.FormEvent) {
    evento.preventDefault();
    setCalculando(true);
    setErroFrete("");
    setOpcoes(null);

    const resposta = await fetch("/api/frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cep,
        itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade })),
      }),
    });

    const dados = await resposta.json().catch(() => ({}));
    setCalculando(false);

    if (!resposta.ok) {
      setErroFrete(dados.erro ?? "Não foi possível calcular o frete");
      return;
    }
    setOpcoes(dados.opcoes);
  }

  if (!pronto) {
    return <div className="mt-10 h-40 animate-pulse bg-ardosia-100" />;
  }

  if (itens.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-ardosia-300 px-6 py-20 text-center">
        <IconeSacola className="mx-auto h-9 w-9 text-ardosia-300" />
        <p className="mt-4 font-display text-xl">Sua sacola está vazia</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ardosia-500">
          Escolha suas peças no catálogo. Frete grátis acima de R$ 399.
        </p>
        <Link href="/produtos" className="botao botao-principal mt-7">
          Ver o catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-ardosia-200 border-y border-ardosia-200">
        {itens.map((item) => (
          <li key={item.varianteId} className="flex gap-4 py-5">
            <Link href={`/produto/${item.produtoSlug}`} className="relative aspect-3/4 w-24 shrink-0 bg-ardosia-100">
              {item.imagemUrl && (
                <Image src={item.imagemUrl} alt={item.produtoNome} fill sizes="96px" className="object-cover" />
              )}
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/produto/${item.produtoSlug}`} className="font-display text-base text-ardosia-900">
                    {item.produtoNome}
                  </Link>
                  <p className="mt-1 text-xs text-ardosia-500">
                    {item.cor} · Tamanho {item.tamanho}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remover(item.varianteId)}
                  className="p-1 text-ardosia-400 hover:text-ardosia-900"
                  aria-label={`Remover ${item.produtoNome}`}
                >
                  <IconeFechar className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="flex items-center border border-ardosia-200">
                  <button
                    type="button"
                    onClick={() => alterarQuantidade(item.varianteId, item.quantidade - 1)}
                    disabled={item.quantidade <= 1}
                    className="px-3 py-1.5 text-ardosia-700 disabled:text-ardosia-300"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.quantidade}</span>
                  <button
                    type="button"
                    onClick={() => alterarQuantidade(item.varianteId, item.quantidade + 1)}
                    disabled={item.quantidade >= item.estoque}
                    className="px-3 py-1.5 text-ardosia-700 disabled:text-ardosia-300"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm font-semibold">{moeda(item.precoCentavos * item.quantidade)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-ardosia-200 bg-white p-6">
        <h2 className="font-display text-lg">Resumo</h2>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ardosia-500">Subtotal</dt>
            <dd>{moeda(subtotalCentavos)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ardosia-500">Frete</dt>
            <dd className="text-ardosia-500">calculado no checkout</dd>
          </div>
        </dl>

        <form onSubmit={calcularFrete} className="mt-5 border-t border-ardosia-200 pt-5">
          <label htmlFor="cep-carrinho" className="rotulo">
            Calcular entrega
          </label>
          <div className="flex gap-2">
            <input
              id="cep-carrinho"
              value={cep}
              onChange={(e) => setCep(mascaraCep(e.target.value))}
              placeholder="00000-000"
              inputMode="numeric"
              className="campo"
            />
            <button type="submit" disabled={calculando || cep.length < 9} className="botao botao-contorno px-4">
              {calculando ? "..." : "Ver"}
            </button>
          </div>
          {erroFrete && <p className="mt-2 text-xs text-red-700">{erroFrete}</p>}

          {opcoes && (
            <ul className="mt-3 space-y-2 text-sm">
              {opcoes.map((o) => (
                <li key={o.metodo} className="flex items-baseline justify-between gap-3">
                  <span className="text-ardosia-600">
                    {o.nome}
                    <span className="block text-xs text-ardosia-400">
                      {o.prazoDias} {o.prazoDias === 1 ? "dia útil" : "dias úteis"}
                    </span>
                  </span>
                  <span className="font-medium">
                    {o.precoCentavos === 0 ? "grátis" : moeda(o.precoCentavos)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="mt-6 flex justify-between border-t border-ardosia-200 pt-5">
          <span className="font-display text-lg">Total parcial</span>
          <span className="font-display text-lg">{moeda(subtotalCentavos)}</span>
        </div>

        <Link href="/checkout" className="botao botao-principal mt-5 w-full">
          Finalizar compra
        </Link>
        <Link
          href="/produtos"
          className="mt-3 block text-center text-sm text-ardosia-600 underline underline-offset-4"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
