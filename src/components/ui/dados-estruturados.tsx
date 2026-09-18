// Serializa JSON-LD sem deixar "</script>" ou "<!--" escaparem do bloco.
export function DadosEstruturados({ dados }: { dados: unknown }) {
  const json = JSON.stringify(dados).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
