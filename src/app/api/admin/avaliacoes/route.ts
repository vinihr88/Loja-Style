import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";

const esquema = z.object({ id: z.string().min(1), acao: z.enum(["aprovar", "excluir"]) });

export async function PATCH(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = esquema.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: analise.data.id },
    include: { produto: { select: { slug: true } } },
  });
  if (!avaliacao) return NextResponse.json({ erro: "Avaliação não encontrada" }, { status: 404 });

  if (analise.data.acao === "aprovar") {
    await prisma.avaliacao.update({ where: { id: avaliacao.id }, data: { aprovada: true } });
  } else {
    await prisma.avaliacao.delete({ where: { id: avaliacao.id } });
  }

  revalidatePath(`/produto/${avaliacao.produto.slug}`);
  return NextResponse.json({ ok: true });
}
