"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mascaraTelefone } from "@/lib/formato";

export function FormularioPerfil({ nome, email, telefone }: { nome: string; email: string; telefone: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nome,
    telefone: telefone ? mascaraTelefone(telefone) : "",
    senhaAtual: "",
    novaSenha: "",
  });
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setSalvando(true);

    const resposta = await fetch("/api/conta/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json().catch(() => ({}));
    setSalvando(false);

    if (!resposta.ok) {
      setMensagem({ tipo: "erro", texto: dados.erro ?? "Não foi possível salvar" });
      return;
    }

    setMensagem({ tipo: "ok", texto: "Dados atualizados." });
    setForm({ ...form, senhaAtual: "", novaSenha: "" });
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="max-w-md space-y-5">
      <div>
        <label htmlFor="nome" className="rotulo">
          Nome
        </label>
        <input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="campo" />
      </div>
      <div>
        <label className="rotulo">E-mail</label>
        <input value={email} disabled className="campo bg-areia-100 text-ardosia-500" />
      </div>
      <div>
        <label htmlFor="telefone" className="rotulo">
          WhatsApp
        </label>
        <input id="telefone" inputMode="numeric" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} className="campo" />
      </div>

      <fieldset className="space-y-4 border-t border-ardosia-200 pt-5">
        <legend className="rotulo">Trocar senha (opcional)</legend>
        <div>
          <label htmlFor="senhaAtual" className="rotulo">
            Senha atual
          </label>
          <input id="senhaAtual" type="password" autoComplete="current-password" value={form.senhaAtual} onChange={(e) => setForm({ ...form, senhaAtual: e.target.value })} className="campo" />
        </div>
        <div>
          <label htmlFor="novaSenha" className="rotulo">
            Nova senha
          </label>
          <input id="novaSenha" type="password" minLength={8} autoComplete="new-password" value={form.novaSenha} onChange={(e) => setForm({ ...form, novaSenha: e.target.value })} className="campo" />
        </div>
      </fieldset>

      {mensagem && (
        <p className={`text-sm font-medium ${mensagem.tipo === "ok" ? "text-green-700" : "text-red-700"}`}>{mensagem.texto}</p>
      )}

      <button type="submit" disabled={salvando} className="botao botao-principal">
        {salvando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
