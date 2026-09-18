import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { esquemaContato, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`contato:${ipDaRequisicao(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ erro: "Muitas mensagens. Tente mais tarde." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaContato.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  await prisma.contato.create({ data: analise.data });
  return NextResponse.json({ ok: true });
}
