"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCarrinho } from "@/components/carrinho/contexto";
import { moeda } from "@/lib/formato";
import { IconeSacola, IconeWhatsapp } from "@/components/ui/icones";

export type VarianteSelecionavel = {
  id: string;
  tamanho: string;
  cor: string;
  corHex: string;
  estoque: number;
};

export function Compra({
  produtoNome,
  produtoSlug,
  imagemUrl,
  precoCentavos,
  precoCheioCentavos,
  variantes,
  whatsapp,
}: {
  produtoNome: string;
  produtoSlug: string;
  imagemUrl: string | null;
  precoCentavos: number;
  precoCheioCentavos: number;
  variantes: VarianteSelecionavel[];
  whatsapp: string;
}) {
  const { adicionar } = useCarrinho();

  const cores = useMemo(
    () => [...new Map(variantes.map((v) => [v.cor, v.corHex])).entries()].map(([nome, hex]) => ({ nome, hex })),
    [variantes],
  );

  const [cor, setCor] = useState(cores[0]?.nome ?? "");
  const [tamanho, setTamanho] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [erro, setErro] = useState("");

  const tamanhosDaCor = variantes.filter((v) => v.cor === cor);
  const selecionada = tamanhosDaCor.find((v) => v.tamanho === tamanho) ?? null;
  const promocao = precoCentavos < precoCheioCentavos;
  const parcela = Math.round(precoCentavos / 3);

  function aoAdicionar() {
    if (!selecionada) {
      setErro("Escolha o tamanho para continuar");
      return;
    }
    setErro("");
    adicionar({
      varianteId: selecionada.id,
      produtoNome,
      produtoSlug,
      tamanho: selecionada.tamanho,
      cor: selecionada.cor,
      imagemUrl,
      precoCentavos,
      quantidade: 1,
      estoque: selecionada.estoque,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2500);
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl text-ardosia-900">{moeda(precoCentavos)}</span>
        {promocao && (
          <span className="text-base text-ardosia-400 line-through">{moeda(precoCheioCentavos)}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-ardosia-500">ou 3x de {moeda(parcela)} sem juros no cartão</p>

      {cores.length > 1 && (
        <div className="mt-7">
          <p className="rotulo">
            Cor: <span className="text-ardosia-900">{cor}</span>
          </p>
          <div className="flex gap-2">
            {cores.map((c) => (
              <button
                key={c.nome}
                type="button"
                onClick={() => {
                  setCor(c.nome);
                  setTamanho(null);
                }}
                aria-pressed={cor === c.nome}
                aria-label={c.nome}
                title={c.nome}
                className={`h-9 w-9 rounded-full border-2 transition-colors ${
                  cor === c.nome ? "border-ouro-600" : "border-ardosia-200 hover:border-ardosia-400"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <p className="rotulo">Tamanho</p>
          <Link href="/guia-de-tamanhos" className="text-xs text-ardosia-600 underline underline-offset-2">
            Guia de tamanhos
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {tamanhosDaCor.map((v) => {
            const esgotado = v.estoque < 1;
            return (
              <button
                key={v.id}
                type="button"
                disabled={esgotado}
                onClick={() => {
                  setTamanho(v.tamanho);
                  setErro("");
                }}
                aria-pressed={tamanho === v.tamanho}
                className={`min-w-12 border px-3 py-2.5 text-sm font-medium transition-colors ${
                  esgotado
                    ? "cursor-not-allowed border-ardosia-100 text-ardosia-300 line-through"
                    : tamanho === v.tamanho
                      ? "border-ardosia-900 bg-ardosia-900 text-areia-50"
                      : "border-ardosia-200 text-ardosia-800 hover:border-ardosia-500"
                }`}
              >
                {v.tamanho}
              </button>
            );
          })}
        </div>

        {selecionada && selecionada.estoque <= 3 && (
          <p className="mt-2.5 text-xs font-medium text-ouro-600">
            Última{selecionada.estoque > 1 ? "s" : ""} {selecionada.estoque} peça
            {selecionada.estoque > 1 ? "s" : ""} neste tamanho
          </p>
        )}
        {erro && <p className="mt-2.5 text-xs font-medium text-red-700">{erro}</p>}
      </div>

      <div className="mt-8 space-y-2.5">
        <button type="button" onClick={aoAdicionar} className="botao botao-principal w-full">
          <IconeSacola className="h-4 w-4" />
          {adicionado ? "Adicionado à sacola" : "Adicionar à sacola"}
        </button>

        {adicionado && (
          <Link href="/carrinho" className="botao botao-ouro w-full">
            Ir para a sacola
          </Link>
        )}

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse na peça ${produtoNome}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="botao botao-contorno w-full"
          >
            <IconeWhatsapp className="h-4 w-4" />
            Tirar dúvida no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
