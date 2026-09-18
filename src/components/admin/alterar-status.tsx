"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROTULO_STATUS, STATUS_PEDIDO } from "@/lib/constantes";

export function AlterarStatus({ pedidoId, statusAtual, rastreioAtual }: { pedidoId: string; statusAtual: string; rastreioAtual: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [rastreio, setRastreio] = useState(rastreioAtual ?? "");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (status === STATUS_PEDIDO.CANCELADO && statusAtual !== STATUS_PEDIDO.CANCELADO) {
      if (!window.confirm("Cancelar este pedido? Se já estava pago, as peças voltam ao estoque.")) return;
    }
    if (status === STATUS_PEDIDO.PAGO && statusAtual === STATUS_PEDIDO.AGUARDANDO_PAGAMENTO) {
      if (!window.confirm("Confirmar recebimento manual do pagamento? O estoque será baixado.")) return;
    }

    setSalvando(true);
    const r = await fetch(`/api/admin/pedidos/${pedidoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rastreioCodigo: rastreio, observacao }),
    });
    const d = await r.json().catch(() => ({}));
    setSalvando(false);

    if (!r.ok) {
      setErro(d.erro ?? "Não foi possível atualizar");
      return;
    }
    setObservacao("");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 border border-ardosia-200 bg-white p-5">
      <h2 className="font-display text-lg">Atualizar pedido</h2>

      <div>
        <label htmlFor="status" className="rotulo">
          Status
        </label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="campo">
          {Object.values(STATUS_PEDIDO).map((s) => (
            <option key={s} value={s}>
              {ROTULO_STATUS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="rastreio" className="rotulo">
          Código de rastreio
        </label>
        <input id="rastreio" value={rastreio} onChange={(e) => setRastreio(e.target.value.toUpperCase())} className="campo font-mono" placeholder="AA123456789BR" />
      </div>

      <div>
        <label htmlFor="observacao" className="rotulo">
          Observação (aparece para o cliente)
        </label>
        <input id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} maxLength={300} className="campo" placeholder="opcional" />
      </div>

      {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

      <button type="submit" disabled={salvando} className="botao botao-principal w-full">
        {salvando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
