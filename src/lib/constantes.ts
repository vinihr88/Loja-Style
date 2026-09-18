export const STATUS_PEDIDO = {
  AGUARDANDO_PAGAMENTO: "AGUARDANDO_PAGAMENTO",
  PAGO: "PAGO",
  EM_SEPARACAO: "EM_SEPARACAO",
  ENVIADO: "ENVIADO",
  ENTREGUE: "ENTREGUE",
  CANCELADO: "CANCELADO",
} as const;

export type StatusPedido = keyof typeof STATUS_PEDIDO;

export const ROTULO_STATUS: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pago",
  EM_SEPARACAO: "Em separação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const LINHA_DO_TEMPO: string[] = [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_SEPARACAO",
  "ENVIADO",
  "ENTREGUE",
];

export const TIPO_CUPOM = { PERCENTUAL: "PERCENTUAL", VALOR: "VALOR" } as const;

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
export const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const NOME_LOJA = "KAUÃ STYLE";
