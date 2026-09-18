"use client";

import { useState } from "react";

export function CampoEstoque({ varianteId, inicial }: { varianteId: string; inicial: number }) {
  const [valor, setValor] = useState(inicial);
  const [estado, setEstado] = useState<"parado" | "salvando" | "ok" | "erro">("parado");

  async function salvar() {
    if (valor === inicial && estado !== "erro") return;
    setEstado("salvando");
    const r = await fetch("/api/admin/estoque", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ varianteId, estoque: valor }),
    });
    setEstado(r.ok ? "ok" : "erro");
    setTimeout(() => setEstado("parado"), 1500);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        onBlur={salvar}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className={`campo w-20 py-1 text-sm ${valor <= 2 ? "border-red-300" : ""}`}
        aria-label="Estoque"
      />
      <span className="w-12 text-xs text-ardosia-400">
        {estado === "salvando" && "..."}
        {estado === "ok" && <span className="text-green-700">salvo</span>}
        {estado === "erro" && <span className="text-red-700">erro</span>}
      </span>
    </span>
  );
}
