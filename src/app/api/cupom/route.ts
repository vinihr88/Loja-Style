import { NextResponse } from "next/server";
import { esquemaCupom, primeiroErro } from "@/lib/validacoes";
import { aplicarCupom, resolverItens } from "@/lib/carrinho";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`cupom:${ipDaRequisicao(req)}`, 15, 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaCupom.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const { subtotalCentavos } = await resolverItens(analise.data.itens);
  if (subtotalCentavos === 0) {
    return NextResponse.json({ erro: "Nenhuma peça disponível na sacola" }, { status: 400 });
  }

  const resultado = await aplicarCupom(analise.data.codigo, subtotalCentavos);
  if ("erro" in resultado) return NextResponse.json({ erro: resultado.erro }, { status: 400 });

  return NextResponse.json({ cupom: resultado.cupom });
}
