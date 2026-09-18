"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { mascaraTelefone } from "@/lib/formato";

function destinoSeguro(valor: string | null): string {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//")) return "/conta";
  return valor;
}

export function FormularioEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível entrar");
      setEnviando(false);
      return;
    }

    const destino = destinoSeguro(parametros.get("destino"));
    router.push(dados.admin && destino === "/conta" ? "/admin" : destino);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="email" className="rotulo">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="senha" className="rotulo">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          autoComplete="current-password"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          className="campo"
        />
      </div>

      {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

      <button type="submit" disabled={enviando} className="botao botao-principal w-full">
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <div className="flex justify-between text-sm">
        <Link href="/recuperar-senha" className="text-ardosia-600 underline underline-offset-4">
          Esqueci a senha
        </Link>
        <Link href="/criar-conta" className="text-ardosia-900 underline underline-offset-4">
          Criar conta
        </Link>
      </div>
    </form>
  );
}

export function FormularioCriarConta() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const resposta = await fetch("/api/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível criar a conta");
      setEnviando(false);
      return;
    }

    router.push("/conta");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="nome" className="rotulo">
          Nome
        </label>
        <input
          id="nome"
          required
          autoComplete="name"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="email" className="rotulo">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="telefone" className="rotulo">
          WhatsApp (opcional)
        </label>
        <input
          id="telefone"
          inputMode="numeric"
          autoComplete="tel"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })}
          className="campo"
        />
      </div>
      <div>
        <label htmlFor="senha" className="rotulo">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          className="campo"
        />
        <p className="mt-1 text-xs text-ardosia-400">Mínimo de 8 caracteres.</p>
      </div>

      {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

      <button type="submit" disabled={enviando} className="botao botao-principal w-full">
        {enviando ? "Criando..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-ardosia-600">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-ardosia-900 underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function FormularioRecuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await fetch("/api/auth/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviado(true);
    setEnviando(false);
  }

  if (enviado) {
    return (
      <p className="text-sm leading-relaxed text-ardosia-600">
        Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha. Ele vale por
        1 hora.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="email" className="rotulo">
          E-mail da conta
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="campo"
        />
      </div>
      <button type="submit" disabled={enviando} className="botao botao-principal w-full">
        {enviando ? "Enviando..." : "Enviar link"}
      </button>
    </form>
  );
}

export function FormularioRedefinir({ token }: { token: string }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const resposta = await fetch("/api/auth/redefinir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha }),
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível redefinir");
      setEnviando(false);
      return;
    }
    router.push("/entrar?redefinida=1");
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="senha" className="rotulo">
          Nova senha
        </label>
        <input
          id="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="campo"
        />
      </div>
      {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
      <button type="submit" disabled={enviando} className="botao botao-principal w-full">
        {enviando ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
