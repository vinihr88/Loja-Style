import type { Metadata } from "next";
import { FAQ } from "@/lib/politicas";
import { DadosEstruturados } from "@/components/ui/dados-estruturados";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Tamanhos, prazos de entrega, trocas, pagamento e rastreio na KAUÃ STYLE.",
};

export default function PaginaFaq() {
  const dadosEstruturados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.pergunta,
      acceptedAnswer: { "@type": "Answer", text: f.resposta },
    })),
  };

  return (
    <div className="container-loja py-10">
      <DadosEstruturados dados={dadosEstruturados} />
      <h1 className="font-display text-3xl sm:text-4xl">Perguntas frequentes</h1>

      <div className="mt-8 max-w-2xl divide-y divide-ardosia-200 border-y border-ardosia-200">
        {FAQ.map((f) => (
          <details key={f.pergunta} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base text-ardosia-900">
              {f.pergunta}
              <span className="text-xl text-ardosia-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ardosia-600">{f.resposta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
