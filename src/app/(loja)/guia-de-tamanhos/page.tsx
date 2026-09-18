import type { Metadata } from "next";
import { WHATSAPP } from "@/lib/constantes";

export const metadata: Metadata = {
  title: "Guia de tamanhos",
  description: "Tabela de medidas das camisetas, jaquetas, calças e bermudas da KAUÃ STYLE.",
};

const TABELAS = [
  {
    titulo: "Camisetas, polos, moletons e jaquetas",
    colunas: ["Tamanho", "Tórax (cm)", "Comprimento (cm)", "Ombro a ombro (cm)"],
    linhas: [
      ["P", "96–100", "68", "44"],
      ["M", "100–106", "70", "46"],
      ["G", "106–112", "72", "48"],
      ["GG", "112–120", "74", "50"],
    ],
  },
  {
    titulo: "Calças (numeração)",
    colunas: ["Tamanho", "Cintura (cm)", "Quadril (cm)", "Comprimento (cm)"],
    linhas: [
      ["38", "78–82", "94", "104"],
      ["40", "82–86", "98", "105"],
      ["42", "86–90", "102", "106"],
      ["44", "90–94", "106", "107"],
      ["46", "94–98", "110", "108"],
    ],
  },
  {
    titulo: "Bermudas",
    colunas: ["Tamanho", "Cintura (cm)", "Quadril (cm)", "Comprimento (cm)"],
    linhas: [
      ["P", "76–82", "96", "48"],
      ["M", "82–88", "100", "50"],
      ["G", "88–94", "104", "52"],
      ["GG", "94–100", "108", "54"],
    ],
  },
  {
    titulo: "Cintos",
    colunas: ["Tamanho", "Cintura (cm)", "Numeração de calça"],
    linhas: [
      ["90", "78–86", "38–40"],
      ["95", "86–94", "42–44"],
      ["100", "94–102", "46"],
    ],
  },
];

export default function PaginaGuia() {
  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Guia de tamanhos</h1>
      <p className="mt-2 max-w-lg text-sm text-ardosia-500">
        Medidas da peça, deitada, em centímetros. Compare com uma roupa que já veste bem.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          {TABELAS.map((t) => (
            <section key={t.titulo}>
              <h2 className="font-display text-xl">{t.titulo}</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[28rem] border border-ardosia-200 bg-white text-sm">
                  <thead>
                    <tr className="bg-areia-100 text-left text-xs uppercase tracking-[0.1em] text-ardosia-500">
                      {t.colunas.map((c) => (
                        <th key={c} className="px-4 py-3 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ardosia-200">
                    {t.linhas.map((linha) => (
                      <tr key={linha[0]}>
                        {linha.map((celula, i) => (
                          <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold" : "text-ardosia-600"}`}>
                            {celula}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-4 border border-ardosia-200 bg-white p-6 text-sm leading-relaxed text-ardosia-600">
          <h2 className="font-display text-lg text-ardosia-900">Como medir</h2>
          <p>
            <strong>Tórax:</strong> de uma axila à outra, com a peça deitada, e multiplique por 2.
          </p>
          <p>
            <strong>Comprimento:</strong> da costura do ombro até a barra.
          </p>
          <p>
            <strong>Cintura:</strong> de um lado a outro do cós, com a calça fechada, vezes 2.
          </p>
          <p>Entre dois tamanhos? Nas peças de alfaiataria e conjuntos, o maior cai melhor.</p>
          {WHATSAPP && (
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="botao botao-contorno w-full">
              Pedir ajuda no WhatsApp
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
