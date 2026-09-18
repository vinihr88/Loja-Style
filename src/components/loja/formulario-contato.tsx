"use client";

import { useState } from "react";

export function FormularioContato() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [estado, setEstado] = useState<"parado" | "enviando" | "enviado">("parado");
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEstado("enviando");

    const resposta = await fetch("/api/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível enviar");
      setEstado("parado");
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <p className="border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
        Mensagem recebida. Respondemos em até 1 dia útil no e-mail informado.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="rotulo">
            Nome
          </label>
          <input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="campo" />
        </div>
        <div>
          <label htmlFor="email" className="rotulo">
            E-mail
          </label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="campo" />
        </div>
      </div>
      <div>
        <label htmlFor="assunto" className="rotulo">
          Assunto
        </label>
        <input id="assunto" required value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} placeholder="Ex.: dúvida sobre o pedido KS2609..." className="campo" />
      </div>
      <div>
        <label htmlFor="mensagem" className="rotulo">
          Mensagem
        </label>
        <textarea id="mensagem" required minLength={10} rows={5} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} className="campo resize-none" />
      </div>
      {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
      <button type="submit" disabled={estado === "enviando"} className="botao botao-principal">
        {estado === "enviando" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
