import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";
import { esquemaCupomAdmin, primeiroErro } from "@/lib/validacoes";

export async function POST(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = esquemaCupomAdmin.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const d = analise.data;
  if (d.tipo === "PERCENTUAL" && d.valor > 90) {
    return NextResponse.json({ erro: "Percentual máximo de 90%" }, { status: 400 });
  }

  const existente = await prisma.cupom.findUnique({ where: { codigo: d.codigo } });
  if (existente) return NextResponse.json({ erro: "Código já existe" }, { status: 409 });

  const cupom = await prisma.cupom.create({
    data: {
      codigo: d.codigo,
      tipo: d.tipo,
      valor: d.valor,
      minimoCentavos: d.minimoCentavos,
      maxUsos: d.maxUsos ?? null,
      expiraEm: d.expiraEm ? new Date(d.expiraEm) : null,
      ativo: d.ativo,
    },
  });
  return NextResponse.json({ cupom }, { status: 201 });
}

// Cupom já usado não é excluído, é desativado.
export async function DELETE(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const cupom = await prisma.cupom.findUnique({ where: { id: analise.data.id } });
  if (!cupom) return NextResponse.json({ erro: "Cupom não encontrado" }, { status: 404 });

  if (cupom.usos > 0) {
    await prisma.cupom.update({ where: { id: cupom.id }, data: { ativo: false } });
    return NextResponse.json({ desativado: true });
  }

  await prisma.cupom.delete({ where: { id: cupom.id } });
  return NextResponse.json({ desativado: false });
}

export async function PATCH(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = z
    .object({ id: z.string().min(1), ativo: z.boolean() })
    .safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  await prisma.cupom.update({ where: { id: analise.data.id }, data: { ativo: analise.data.ativo } });
  return NextResponse.json({ ok: true });
}
