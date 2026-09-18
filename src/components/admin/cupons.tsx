"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { data, moeda } from "@/lib/formato";

type Cupom = {
  id: string;
  codigo: string;
  tipo: string;
  valor: number;
  minimoCentavos: number;
  maxUsos: number | null;
  usos: number;
  expiraEm: string | null;
  ativo: boolean;
};

export function Cupons({ cupons }: { cupons: Cupom[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ codigo: "", tipo: "PERCENTUAL", valor: "", minimo: "", maxUsos: "", expiraEm: "" });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const corpo = {
      codigo: form.codigo,
      tipo: form.tipo,
      valor: form.tipo === "PERCENTUAL" ? Number(form.valor) : Math.round(Number(form.valor.replace(",", ".")) * 100),
      minimoCentavos: form.minimo ? Math.round(Number(form.minimo.replace(",", ".")) * 100) : 0,
      maxUsos: form.maxUsos ? Number(form.maxUsos) : null,
      expiraEm: form.expiraEm ? new Date(form.expiraEm + "T23:59:59").toISOString() : null,
      ativo: true,
    };

    const r = await fetch("/api/admin/cupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    const d = await r.json().catch(() => ({}));
    setSalvando(false);

    if (!r.ok) {
      setErro(d.erro ?? "Não foi possível criar");
      return;
    }
    setForm({ codigo: "", tipo: "PERCENTUAL", valor: "", minimo: "", maxUsos: "", expiraEm: "" });
    router.refresh();
  }

  async function alternar(c: Cupom) {
    await fetch("/api/admin/cupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, ativo: !c.ativo }) });
    router.refresh();
  }

  async function remover(c: Cupom) {
    if (!window.confirm(`Remover ${c.codigo}? Cupom já usado é apenas desativado.`)) return;
    await fetch("/api/admin/cupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
    router.refresh();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
      <div className="overflow-x-auto border border-ardosia-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-areia-100 text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Desconto</th>
              <th className="px-4 py-3 font-semibold">Mínimo</th>
              <th className="px-4 py-3 font-semibold">Usos</th>
              <th className="px-4 py-3 font-semibold">Validade</th>
              <th className="px-4 py-3 font-semibold">Ativo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ardosia-200">
            {cupons.map((c) => (
              <tr key={c.id} className={c.ativo ? "" : "text-ardosia-400"}>
                <td className="px-4 py-3 font-mono font-semibold">{c.codigo}</td>
                <td className="px-4 py-3">{c.tipo === "PERCENTUAL" ? `${c.valor}%` : moeda(c.valor)}</td>
                <td className="px-4 py-3">{c.minimoCentavos ? moeda(c.minimoCentavos) : "—"}</td>
                <td className="px-4 py-3">
                  {c.usos}
                  {c.maxUsos ? ` / ${c.maxUsos}` : ""}
                </td>
                <td className="px-4 py-3">{c.expiraEm ? data(c.expiraEm) : "sem prazo"}</td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={c.ativo} onChange={() => alternar(c)} className="h-4 w-4 accent-ardosia-900" aria-label={`Ativar ${c.codigo}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => remover(c)} className="text-xs text-ardosia-500 underline underline-offset-2 hover:text-red-700">
                    remover
                  </button>
                </td>
              </tr>
            ))}
            {cupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ardosia-500">
                  Nenhum cupom.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={criar} className="h-fit space-y-4 border border-ardosia-200 bg-white p-5">
        <h2 className="font-display text-lg">Novo cupom</h2>
        <div>
          <label className="rotulo">Código</label>
          <input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} className="campo font-mono" placeholder="VERAO15" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="campo">
              <option value="PERCENTUAL">% do subtotal</option>
              <option value="VALOR">valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className="rotulo">{form.tipo === "PERCENTUAL" ? "Percentual" : "Valor (R$)"}</label>
            <input required inputMode="decimal" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="campo" placeholder={form.tipo === "PERCENTUAL" ? "10" : "20,00"} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="rotulo">Mínimo (R$)</label>
            <input inputMode="decimal" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} className="campo" placeholder="0" />
          </div>
          <div>
            <label className="rotulo">Máx. usos</label>
            <input type="number" min={1} value={form.maxUsos} onChange={(e) => setForm({ ...form, maxUsos: e.target.value })} className="campo" placeholder="ilimitado" />
          </div>
        </div>
        <div>
          <label className="rotulo">Válido até</label>
          <input type="date" value={form.expiraEm} onChange={(e) => setForm({ ...form, expiraEm: e.target.value })} className="campo" />
        </div>
        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
        <button type="submit" disabled={salvando} className="botao botao-principal w-full">
          {salvando ? "Criando..." : "Criar cupom"}
        </button>
      </form>
    </div>
  );
}
