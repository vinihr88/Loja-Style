import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { esquemaAvaliacao, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`avaliacao:${ipDaRequisicao(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ erro: "Muitas avaliações. Tente mais tarde." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaAvaliacao.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const produto = await prisma.produto.findFirst({
    where: { id: analise.data.produtoId, ativo: true },
    select: { id: true },
  });
  if (!produto) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });

  const usuario = await usuarioAtual();

  await prisma.avaliacao.create({
    data: {
      produtoId: produto.id,
      usuarioId: usuario?.id ?? null,
      nome: analise.data.nome,
      nota: analise.data.nota,
      comentario: analise.data.comentario,
      aprovada: false,
    },
  });

  return NextResponse.json({ ok: true });
}
