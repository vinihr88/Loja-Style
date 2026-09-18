// Regras de entrega da loja. Frete grátis acima do limite, retirada sem custo.
// Faixas por região do CEP — trocar por cálculo dos Correios é substituir
// calcularFrete() mantendo o formato de retorno.

export const FRETE_GRATIS_ACIMA_DE = 39_900; // R$ 399,00

export type OpcaoFrete = {
  metodo: "PAC" | "SEDEX" | "RETIRADA";
  nome: string;
  precoCentavos: number;
  prazoDias: number;
  descricao: string;
};

type Faixa = { pac: number; sedex: number; prazoPac: number; prazoSedex: number };

// Prefixo do CEP → custo base. Sudeste mais barato: a loja fica em São Paulo.
function faixaPorCep(cep: string): Faixa {
  const prefixo = Number(cep.slice(0, 2));

  if (prefixo >= 1 && prefixo <= 19) return { pac: 1990, sedex: 3490, prazoPac: 4, prazoSedex: 2 };
  if (prefixo >= 20 && prefixo <= 39) return { pac: 2490, sedex: 3990, prazoPac: 6, prazoSedex: 3 };
  if (prefixo >= 40 && prefixo <= 65) return { pac: 3290, sedex: 4990, prazoPac: 9, prazoSedex: 4 };
  if (prefixo >= 66 && prefixo <= 69) return { pac: 3990, sedex: 5990, prazoPac: 12, prazoSedex: 6 };
  if (prefixo >= 70 && prefixo <= 79) return { pac: 2890, sedex: 4490, prazoPac: 7, prazoSedex: 3 };
  return { pac: 2690, sedex: 4290, prazoPac: 7, prazoSedex: 3 };
}

export function calcularFrete(cep: string, subtotalCentavos: number): OpcaoFrete[] {
  const faixa = faixaPorCep(cep);
  const gratis = subtotalCentavos >= FRETE_GRATIS_ACIMA_DE;

  return [
    {
      metodo: "PAC",
      nome: "Entrega padrão",
      precoCentavos: gratis ? 0 : faixa.pac,
      prazoDias: faixa.prazoPac,
      descricao: gratis ? "Frete grátis nesta compra" : "Correios PAC",
    },
    {
      metodo: "SEDEX",
      nome: "Entrega expressa",
      precoCentavos: faixa.sedex,
      prazoDias: faixa.prazoSedex,
      descricao: "Correios SEDEX",
    },
    {
      metodo: "RETIRADA",
      nome: "Retirar com a loja",
      precoCentavos: 0,
      prazoDias: 1,
      descricao: "Combinamos ponto e horário pelo WhatsApp",
    },
  ];
}

export function opcaoDeFrete(
  metodo: string,
  cep: string,
  subtotalCentavos: number,
): OpcaoFrete | null {
  return calcularFrete(cep, subtotalCentavos).find((o) => o.metodo === metodo) ?? null;
}
