"use client";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-ouro-600">Algo deu errado</p>
      <h1 className="mt-3 font-display text-3xl">Não conseguimos carregar esta página</h1>
      <p className="mt-3 text-sm text-ardosia-500">Tente de novo. Se continuar, fale com a gente pelo WhatsApp.</p>
      <button type="button" onClick={reset} className="botao botao-principal mt-8">
        Tentar novamente
      </button>
    </div>
  );
}
