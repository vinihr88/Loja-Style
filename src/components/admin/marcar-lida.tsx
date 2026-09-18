"use client";

import { useRouter } from "next/navigation";

export function MarcarLida({ id, lida }: { id: string; lida: boolean }) {
  const router = useRouter();

  async function alternar() {
    await fetch("/api/admin/mensagens", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, lida: !lida }) });
    router.refresh();
  }

  return (
    <button type="button" onClick={alternar} className="text-xs text-ardosia-500 underline underline-offset-2">
      {lida ? "marcar como não lida" : "marcar como lida"}
    </button>
  );
}
