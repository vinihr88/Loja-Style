"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ItemCarrinho = {
  varianteId: string;
  produtoNome: string;
  produtoSlug: string;
  tamanho: string;
  cor: string;
  imagemUrl: string | null;
  precoCentavos: number;
  quantidade: number;
  estoque: number;
};

type Contexto = {
  itens: ItemCarrinho[];
  pronto: boolean;
  quantidadeTotal: number;
  subtotalCentavos: number;
  adicionar: (item: ItemCarrinho) => void;
  alterarQuantidade: (varianteId: string, quantidade: number) => void;
  remover: (varianteId: string) => void;
  limpar: () => void;
};

const CHAVE = "kauastyle:carrinho:v1";
const CarrinhoContexto = createContext<Contexto | null>(null);

function ler(): ItemCarrinho[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function ProvedorCarrinho({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setItens(ler());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      // armazenamento cheio ou bloqueado: o carrinho segue só em memória
    }
  }, [itens, pronto]);

  const adicionar = useCallback((novo: ItemCarrinho) => {
    setItens((atuais) => {
      const existente = atuais.find((i) => i.varianteId === novo.varianteId);
      if (!existente) return [...atuais, novo];
      return atuais.map((i) =>
        i.varianteId === novo.varianteId
          ? { ...i, quantidade: Math.min(i.quantidade + novo.quantidade, i.estoque) }
          : i,
      );
    });
  }, []);

  const alterarQuantidade = useCallback((varianteId: string, quantidade: number) => {
    setItens((atuais) =>
      atuais
        .map((i) =>
          i.varianteId === varianteId
            ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.estoque)) }
            : i,
        )
        .filter((i) => i.quantidade > 0),
    );
  }, []);

  const remover = useCallback((varianteId: string) => {
    setItens((atuais) => atuais.filter((i) => i.varianteId !== varianteId));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const valor = useMemo<Contexto>(
    () => ({
      itens,
      pronto,
      quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
      subtotalCentavos: itens.reduce((s, i) => s + i.precoCentavos * i.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
    }),
    [itens, pronto, adicionar, alterarQuantidade, remover, limpar],
  );

  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
}

export function useCarrinho(): Contexto {
  const contexto = useContext(CarrinhoContexto);
  if (!contexto) throw new Error("useCarrinho precisa estar dentro de ProvedorCarrinho");
  return contexto;
}
