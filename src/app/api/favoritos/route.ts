import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

const esquema = z.object({ produtoId: z.string().min(1).max(40) });

export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ logado: false, ids: [] });

  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: usuario.id },
    select: { produtoId: true },
  });
  return NextResponse.json({ logado: true, ids: favoritos.map((f) => f.produtoId) });
}

export async function POST(req: Request) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Entre na sua conta para favoritar" }, { status: 401 });

  const analise = esquema.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const chave = { usuarioId_produtoId: { usuarioId: usuario.id, produtoId: analise.data.produtoId } };
  const existente = await prisma.favorito.findUnique({ where: chave });

  if (existente) {
    await prisma.favorito.delete({ where: chave });
    return NextResponse.json({ favorito: false });
  }

  await prisma.favorito.create({ data: { usuarioId: usuario.id, produtoId: analise.data.produtoId } });
  return NextResponse.json({ favorito: true });
}
