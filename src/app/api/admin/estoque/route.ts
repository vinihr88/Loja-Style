import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";

const esquema = z.object({ varianteId: z.string().min(1), estoque: z.number().int().min(0).max(9999) });

export async function PATCH(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = esquema.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const variante = await prisma.variante.update({
    where: { id: analise.data.varianteId },
    data: { estoque: analise.data.estoque },
    include: { produto: { select: { slug: true } } },
  });

  revalidatePath(`/produto/${variante.produto.slug}`);
  return NextResponse.json({ ok: true });
}
