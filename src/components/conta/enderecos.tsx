"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mascaraCep } from "@/lib/formato";
import { UFS } from "@/lib/constantes";

type Endereco = {
  id: string;
  apelido: string;
  destinatario: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  padrao: boolean;
};

const VAZIO = { apelido: "Casa", destinatario: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "SP" };

export function Enderecos({ enderecos, nomeUsuario }: { enderecos: Endereco[]; nomeUsuario: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ ...VAZIO, destinatario: nomeUsuario });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarCep(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const e = await r.json();
      if (!e.erro) setForm((f) => ({ ...f, logradouro: e.logradouro || f.logradouro, bairro: e.bairro || f.bairro, cidade: e.localidade || f.cidade, uf: e.uf || f.uf }));
    } catch {
      // preenchimento manual
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const r = await fetch("/api/conta/enderecos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json().catch(() => ({}));
    setSalvando(false);
    if (!r.ok) {
      setErro(d.erro ?? "Não foi possível salvar");
      return;
    }
    setAberto(false);
    setForm({ ...VAZIO, destinatario: nomeUsuario });
    router.refresh();
  }

  async function remover(id: string) {
    await fetch("/api/conta/enderecos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div>
      {enderecos.length === 0 && !aberto && (
        <p className="text-sm text-ardosia-500">Nenhum endereço salvo ainda.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {enderecos.map((e) => (
          <li key={e.id} className="border border-ardosia-200 bg-white p-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{e.apelido}</p>
              <button type="button" onClick={() => remover(e.id)} className="text-xs text-ardosia-500 underline underline-offset-2 hover:text-red-700">
                remover
              </button>
            </div>
            <address className="mt-2 not-italic leading-relaxed text-ardosia-600">
              {e.destinatario}
              <br />
              {e.logradouro}, {e.numero}
              {e.complemento ? ` — ${e.complemento}` : ""}
              <br />
              {e.bairro} · {e.cidade}/{e.uf} · CEP {e.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
            </address>
          </li>
        ))}
      </ul>

      {aberto ? (
        <form onSubmit={salvar} className="mt-6 max-w-xl space-y-4 border border-ardosia-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="rotulo">Apelido</label>
              <input required value={form.apelido} onChange={(e) => setForm({ ...form, apelido: e.target.value })} className="campo" />
            </div>
            <div>
              <label className="rotulo">Destinatário</label>
              <input required value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })} className="campo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="rotulo">CEP</label>
              <input required inputMode="numeric" value={form.cep} onChange={(e) => { const v = mascaraCep(e.target.value); setForm({ ...form, cep: v }); buscarCep(v); }} className="campo" />
            </div>
            <div className="sm:col-span-4">
              <label className="rotulo">Rua</label>
              <input required value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} className="campo" />
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo">Número</label>
              <input required value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="campo" />
            </div>
            <div className="sm:col-span-4">
              <label className="rotulo">Complemento</label>
              <input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} className="campo" />
            </div>
            <div className="sm:col-span-3">
              <label className="rotulo">Bairro</label>
              <input required value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} className="campo" />
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo">Cidade</label>
              <input required value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="campo" />
            </div>
            <div>
              <label className="rotulo">UF</label>
              <select value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} className="campo">
                {UFS.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
          {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={salvando} className="botao botao-principal">
              {salvando ? "Salvando..." : "Salvar endereço"}
            </button>
            <button type="button" onClick={() => setAberto(false)} className="botao botao-contorno">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        enderecos.length < 5 && (
          <button type="button" onClick={() => setAberto(true)} className="botao botao-contorno mt-6">
            Adicionar endereço
          </button>
        )
      )}
    </div>
  );
}
