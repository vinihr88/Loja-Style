import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assinaturaValida, consultarPagamento, gatewayConfigurado } from "@/lib/mercadopago";
import { confirmarPagamento, registrarEvento } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

// O webhook só avisa qual pagamento olhar. A verdade vem da consulta à API.
export async function POST(req: Request) {
  if (!gatewayConfigurado()) return NextResponse.json({ ok: true });

  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  };

  const tipo = corpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const idPagamento = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (tipo !== "payment" || !idPagamento) return NextResponse.json({ ok: true });

  const valida = assinaturaValida({
    cabecalhoAssinatura: req.headers.get("x-signature"),
    cabecalhoRequestId: req.headers.get("x-request-id"),
    idRecurso: idPagamento,
  });
  if (!valida) return NextResponse.json({ erro: "Assinatura inválida" }, { status: 401 });

  const pagamento = await consultarPagamento(idPagamento);
  if (!pagamento || !pagamento.referenciaExterna) return NextResponse.json({ ok: true });

  const pedido = await prisma.pedido.findUnique({ where: { numero: pagamento.referenciaExterna } });
  if (!pedido) return NextResponse.json({ ok: true });

  if (pagamento.status === "approved") {
    await confirmarPagamento({
      pedidoId: pedido.id,
      pagamentoId: pagamento.id,
      pagamentoMetodo: pagamento.metodo,
      valorPagoCentavos: pagamento.valorCentavos,
      origem: "webhook Mercado Pago",
    });
  } else if (pedido.pagamentoStatus !== pagamento.status) {
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { pagamentoId: pagamento.id, pagamentoStatus: pagamento.status, pagamentoMetodo: pagamento.metodo },
    });
    await registrarEvento(pedido.id, pedido.status, `Gateway informou status "${pagamento.status}".`);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
