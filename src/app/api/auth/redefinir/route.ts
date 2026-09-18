import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encerrarTodasSessoes, gerarHashSenha, hashDoToken } from "@/lib/auth";
import { esquemaRedefinir, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`redefinir:${ipDaRequisicao(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaRedefinir.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const registro = await prisma.tokenRecuperacao.findUnique({
    where: { tokenHash: hashDoToken(analise.data.token) },
  });

  if (!registro || registro.usadoEm || registro.expiraEm < new Date()) {
    return NextResponse.json({ erro: "Link inválido ou expirado. Peça um novo." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash: await gerarHashSenha(analise.data.senha) },
    }),
    prisma.tokenRecuperacao.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
  ]);

  // Uso único e derruba todas as sessões abertas.
  await encerrarTodasSessoes(registro.usuarioId);

  return NextResponse.json({ ok: true });
}
