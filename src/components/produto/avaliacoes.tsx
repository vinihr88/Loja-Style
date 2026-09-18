"use client";

import { useState } from "react";
import { data } from "@/lib/formato";
import { IconeEstrela } from "@/components/ui/icones";

export type Avaliacao = {
  id: string;
  nome: string;
  nota: number;
  comentario: string;
  criadoEm: string;
};

export function Estrelas({ nota, className = "h-4 w-4" }: { nota: number; className?: string }) {
  return (
    <span className="flex gap-0.5 text-ouro-500" aria-label={`Nota ${nota.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconeEstrela key={n} className={className} preenchida={n <= Math.round(nota)} />
      ))}
    </span>
  );
}

export function Avaliacoes({
  produtoId,
  avaliacoes,
  media,
}: {
  produtoId: string;
  avaliacoes: Avaliacao[];
  media: number;
}) {
  const [form, setForm] = useState({ nome: "", nota: 5, comentario: "" });
  const [estado, setEstado] = useState<"parado" | "enviando" | "enviado">("parado");
  const [erro, setErro] = useState("");

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado("enviando");
    setErro("");

    const resposta = await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId, ...form }),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível enviar sua avaliação");
      setEstado("parado");
      return;
    }

    setEstado("enviado");
    setForm({ nome: "", nota: 5, comentario: "" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        {avaliacoes.length === 0 ? (
          <p className="text-sm text-ardosia-500">
            Esta peça ainda não tem avaliação publicada. A sua pode ser a primeira.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl">{media.toFixed(1)}</span>
              <div>
                <Estrelas nota={media} />
                <p className="mt-1 text-xs text-ardosia-500">
                  {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
                </p>
              </div>
            </div>

            <ul className="mt-7 space-y-6">
              {avaliacoes.map((a) => (
                <li key={a.id} className="border-b border-ardosia-200 pb-6 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ardosia-900">{a.nome}</p>
                    <span className="text-xs text-ardosia-400">{data(a.criadoEm)}</span>
                  </div>
                  <Estrelas nota={a.nota} className="mt-1.5 h-3.5 w-3.5" />
                  <p className="mt-2.5 text-sm leading-relaxed text-ardosia-600">{a.comentario}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="border border-ardosia-200 bg-white p-6">
        <h3 className="font-display text-lg">Avaliar esta peça</h3>

        {estado === "enviado" ? (
          <p className="mt-3 text-sm leading-relaxed text-ardosia-600">
            Recebemos sua avaliação. Ela aparece aqui assim que passar pela conferência da loja.
          </p>
        ) : (
          <form onSubmit={enviar} className="mt-4 space-y-4">
            <div>
              <label htmlFor="avaliacao-nome" className="rotulo">
                Seu nome
              </label>
              <input
                id="avaliacao-nome"
                required
                minLength={2}
                maxLength={60}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="campo"
              />
            </div>

            <div>
              <span className="rotulo">Nota</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, nota: n })}
                    aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                    className="text-ouro-500"
                  >
                    <IconeEstrela className="h-6 w-6" preenchida={n <= form.nota} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="avaliacao-comentario" className="rotulo">
                Comentário
              </label>
              <textarea
                id="avaliacao-comentario"
                required
                minLength={10}
                maxLength={800}
                rows={4}
                value={form.comentario}
                onChange={(e) => setForm({ ...form, comentario: e.target.value })}
                className="campo resize-none"
                placeholder="Como foi o caimento, o tecido e a entrega?"
              />
            </div>

            {erro && <p className="text-xs font-medium text-red-700">{erro}</p>}

            <button type="submit" disabled={estado === "enviando"} className="botao botao-principal w-full">
              {estado === "enviando" ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
