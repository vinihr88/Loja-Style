import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { conferirSenha, criarSessao } from "@/lib/auth";
import { esquemaLogin, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";

const HASH_SACRIFICIO = "$2b$12$Nxp09pqLRONgzK7pfSQRJODSq1PWfTBl8kHiaFJvsXA0u4hHg9JG6";

export async function POST(req: Request) {
  const ip = ipDaRequisicao(req);
  if (!limitar(`login:ip:${ip}`, 20, 15 * 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaLogin.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const { email, senha } = analise.data;
  if (!limitar(`login:conta:${email}`, 8, 15 * 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
  }

  // Mesma resposta e mesmo custo para e-mail inexistente e senha errada:
  // o bcrypt roda sempre, contra um hash de sacrifício quando a conta não existe.
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const valida = await conferirSenha(senha, usuario?.senhaHash ?? HASH_SACRIFICIO);
  if (!usuario || !valida) {
    return NextResponse.json({ erro: "E-mail ou senha incorretos" }, { status: 401 });
  }

  await criarSessao(usuario.id);
  return NextResponse.json({ ok: true, admin: usuario.admin });
}
