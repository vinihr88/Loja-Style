import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/constantes";

const API = "https://api.mercadopago.com";

export function gatewayConfigurado(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function token(): string {
  const valor = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!valor) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return valor;
}

export type ItemPreferencia = {
  titulo: string;
  quantidade: number;
  precoCentavos: number;
};

// Checkout Pro: o cliente digita o cartão no ambiente do Mercado Pago.
export async function criarPreferencia(params: {
  numeroPedido: string;
  itens: ItemPreferencia[];
  freteCentavos: number;
  descontoCentavos: number;
  pagador: { nome: string; email: string; telefone: string; cpf: string };
}): Promise<{ id: string; url: string } | { erro: string }> {
  const items = params.itens.map((i) => ({
    title: i.titulo.slice(0, 250),
    quantity: i.quantidade,
    currency_id: "BRL",
    unit_price: Number((i.precoCentavos / 100).toFixed(2)),
  }));

  if (params.freteCentavos > 0) {
    items.push({
      title: "Frete",
      quantity: 1,
      currency_id: "BRL",
      unit_price: Number((params.freteCentavos / 100).toFixed(2)),
    });
  }
  if (params.descontoCentavos > 0) {
    items.push({
      title: "Desconto",
      quantity: 1,
      currency_id: "BRL",
      unit_price: -Number((params.descontoCentavos / 100).toFixed(2)),
    });
  }

  const [primeiroNome, ...resto] = params.pagador.nome.split(" ");

  const corpo = {
    items,
    external_reference: params.numeroPedido,
    payer: {
      name: primeiroNome,
      surname: resto.join(" ") || primeiroNome,
      email: params.pagador.email,
      identification: { type: "CPF", number: params.pagador.cpf },
    },
    back_urls: {
      success: `${SITE_URL}/pedido/${params.numeroPedido}`,
      pending: `${SITE_URL}/pedido/${params.numeroPedido}`,
      failure: `${SITE_URL}/pedido/${params.numeroPedido}`,
    },
    auto_return: "approved",
    notification_url: `${SITE_URL}/api/pagamentos/mercadopago/webhook`,
    statement_descriptor: "KAUASTYLE",
  };

  try {
    const resposta = await fetch(`${API}/checkout/preferences`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    if (!resposta.ok) return { erro: `Gateway respondeu ${resposta.status}` };

    const dados = (await resposta.json()) as { id: string; init_point: string; sandbox_init_point: string };
    return { id: dados.id, url: dados.init_point || dados.sandbox_init_point };
  } catch {
    return { erro: "Não foi possível falar com o gateway" };
  }
}

export type Pagamento = {
  id: string;
  status: string;
  statusDetalhe: string;
  metodo: string | null;
  valorCentavos: number;
  referenciaExterna: string | null;
};

// O webhook só avisa "olhe o pagamento X"; a verdade vem desta consulta.
export async function consultarPagamento(id: string): Promise<Pagamento | null> {
  try {
    const resposta = await fetch(`${API}/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    });
    if (!resposta.ok) return null;

    const d = (await resposta.json()) as {
      id: number;
      status: string;
      status_detail: string;
      payment_method_id: string | null;
      transaction_amount: number;
      external_reference: string | null;
    };

    return {
      id: String(d.id),
      status: d.status,
      statusDetalhe: d.status_detail,
      metodo: d.payment_method_id,
      valorCentavos: Math.round(d.transaction_amount * 100),
      referenciaExterna: d.external_reference,
    };
  } catch {
    return null;
  }
}

// Assinatura do cabeçalho x-signature, conforme documentação do gateway.
export function assinaturaValida(params: {
  cabecalhoAssinatura: string | null;
  cabecalhoRequestId: string | null;
  idRecurso: string;
}): boolean {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo) return true; // sem segredo configurado, a validação fica a cargo da consulta à API
  if (!params.cabecalhoAssinatura) return false;

  const partes = Object.fromEntries(
    params.cabecalhoAssinatura.split(",").map((p) => {
      const [chave, valor] = p.split("=");
      return [chave?.trim(), valor?.trim()];
    }),
  );

  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const base = `id:${params.idRecurso};request-id:${params.cabecalhoRequestId ?? ""};ts:${ts};`;
  const esperado = createHmac("sha256", segredo).update(base).digest("hex");

  const a = Buffer.from(esperado, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
