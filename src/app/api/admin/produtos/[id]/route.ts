import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";
import { esquemaProdutoAdmin, primeiroErro } from "@/lib/validacoes";
import { removerProduto, salvarProduto } from "@/lib/admin-produtos";

type Contexto = { params: Promise<{ id: string }> };

function revalidar(slug: string) {
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(`/produto/${slug}`);
}

export async function GET(_req: Request, { params }: Contexto) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { imagens: { orderBy: { ordem: "asc" } }, variantes: true, categoria: true },
  });
  if (!produto) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });
  return NextResponse.json({ produto });
}

export async function PUT(req: Request, { params }: Contexto) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const analise = esquemaProdutoAdmin.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const atual = await prisma.produto.findUnique({ where: { id }, select: { slug: true } });
  if (!atual) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });

  const conflito = await prisma.produto.findFirst({
    where: { slug: analise.data.slug, id: { not: id } },
    select: { id: true },
  });
  if (conflito) return NextResponse.json({ erro: "Já existe uma peça com este slug" }, { status: 409 });

  await salvarProduto(analise.data, id);
  revalidar(atual.slug);
  if (atual.slug !== analise.data.slug) revalidar(analise.data.slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Contexto) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const atual = await prisma.produto.findUnique({ where: { id }, select: { slug: true } });
  if (!atual) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });

  const resultado = await removerProduto(id);
  revalidar(atual.slug);
  return NextResponse.json(resultado);
}
