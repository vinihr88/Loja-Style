import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { conferirSenha, encerrarTodasSessoes, gerarHashSenha, usuarioAtual, criarSessao } from "@/lib/auth";
import { esquemaSenha, primeiroErro } from "@/lib/validacoes";
import { apenasDigitos } from "@/lib/formato";

const esquemaPerfil = z.object({
  nome: z.string().trim().min(2).max(80),
  telefone: z.string().transform(apenasDigitos).refine((v) => v.length === 0 || v.length >= 10, "Telefone inválido"),
  senhaAtual: z.string().max(72).optional().or(z.literal("")),
  novaSenha: esquemaSenha.optional().or(z.literal("")),
});

export async function PUT(req: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const analise = esquemaPerfil.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const { nome, telefone, senhaAtual, novaSenha } = analise.data;
  const dados: { nome: string; telefone: string | null; senhaHash?: string } = { nome, telefone: telefone || null };

  if (novaSenha) {
    const registro = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } });
    if (!senhaAtual || !(await conferirSenha(senhaAtual, registro.senhaHash))) {
      return NextResponse.json({ erro: "Senha atual incorreta" }, { status: 400 });
    }
    dados.senhaHash = await gerarHashSenha(novaSenha);
  }

  await prisma.usuario.update({ where: { id: usuario.id }, data: dados });

  if (dados.senhaHash) {
    await encerrarTodasSessoes(usuario.id);
    await criarSessao(usuario.id);
  }

  return NextResponse.json({ ok: true });
}
