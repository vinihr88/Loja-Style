"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconeCoracao } from "@/components/ui/icones";

export function BotaoFavorito({ produtoId }: { produtoId: string }) {
  const router = useRouter();
  const [favorito, setFavorito] = useState(false);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((d) => {
        setLogado(Boolean(d.logado));
        setFavorito((d.ids ?? []).includes(produtoId));
      })
      .catch(() => null);
  }, [produtoId]);

  async function alternar() {
    if (!logado) {
      router.push("/entrar?destino=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const r = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setFavorito(Boolean(d.favorito));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={favorito}
      aria-label={favorito ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-colors ${
        favorito ? "border-ardosia-900 text-ardosia-900" : "border-ardosia-200 text-ardosia-500 hover:border-ardosia-500"
      }`}
    >
      <IconeCoracao className="h-5 w-5" preenchido={favorito} />
    </button>
  );
}
