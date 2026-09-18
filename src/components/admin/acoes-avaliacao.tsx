"use client";

import { useRouter } from "next/navigation";

export function AcoesAvaliacao({ id, aprovada }: { id: string; aprovada: boolean }) {
  const router = useRouter();

  async function agir(acao: "aprovar" | "excluir") {
    if (acao === "excluir" && !window.confirm("Excluir esta avaliação?")) return;
    await fetch("/api/admin/avaliacoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, acao }) });
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-xs">
      {!aprovada && (
        <button type="button" onClick={() => agir("aprovar")} className="font-semibold text-green-700 underline underline-offset-2">
          aprovar
        </button>
      )}
      <button type="button" onClick={() => agir("excluir")} className="text-ardosia-500 underline underline-offset-2 hover:text-red-700">
        excluir
      </button>
    </div>
  );
}
