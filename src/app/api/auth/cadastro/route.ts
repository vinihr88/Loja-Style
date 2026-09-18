import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { criarSessao, gerarHashSenha } from "@/lib/auth";
import { esquemaCadastro, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";

export async function POST(req: Request) {
  if (!limitar(`cadastro:${ipDaRequisicao(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ erro: "Muitas contas criadas deste endereço. Tente mais tarde." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaCadastro.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const { nome, email, senha, telefone } = analise.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail" }, { status: 409 });
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash: await gerarHashSenha(senha), telefone: telefone || null },
  });

  await criarSessao(usuario.id);
  return NextResponse.json({ ok: true });
}
