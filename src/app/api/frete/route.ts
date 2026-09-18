import { NextResponse } from "next/server";
import { esquemaFrete, primeiroErro } from "@/lib/validacoes";
import { resolverItens } from "@/lib/carrinho";
import { calcularFrete } from "@/lib/frete";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`frete:${ipDaRequisicao(req)}`, 40, 60_000)) {
    return NextResponse.json({ erro: "Muitas consultas. Aguarde um instante." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaFrete.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const { subtotalCentavos, itens } = await resolverItens(analise.data.itens);
  if (itens.length === 0) {
    return NextResponse.json({ erro: "Nenhuma peça disponível na sacola" }, { status: 400 });
  }

  return NextResponse.json({
    opcoes: calcularFrete(analise.data.cep, subtotalCentavos),
    subtotalCentavos,
  });
}
