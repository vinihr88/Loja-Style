import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { esquemaEndereco, primeiroErro } from "@/lib/validacoes";

export async function POST(req: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const analise = esquemaEndereco.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const quantidade = await prisma.endereco.count({ where: { usuarioId: usuario.id } });
  if (quantidade >= 5) return NextResponse.json({ erro: "Limite de 5 endereços" }, { status: 400 });

  const endereco = await prisma.endereco.create({
    data: { ...analise.data, complemento: analise.data.complemento || null, usuarioId: usuario.id, padrao: quantidade === 0 },
  });
  return NextResponse.json({ endereco });
}

export async function DELETE(req: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const analise = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  await prisma.endereco.deleteMany({ where: { id: analise.data.id, usuarioId: usuario.id } });
  return NextResponse.json({ ok: true });
}
