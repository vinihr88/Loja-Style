import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";

export async function PATCH(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = z.object({ id: z.string().min(1), lida: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  await prisma.contato.update({ where: { id: analise.data.id }, data: { lida: analise.data.lida } });
  return NextResponse.json({ ok: true });
}
