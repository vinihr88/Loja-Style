import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminDaApi } from "@/lib/auth";
import { esquemaProdutoAdmin, primeiroErro } from "@/lib/validacoes";
import { salvarProduto } from "@/lib/admin-produtos";
import { revalidatePath } from "next/cache";

export async function GET() {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const produtos = await prisma.produto.findMany({
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      slug: true,
      precoCentavos: true,
      precoPromocionalCentavos: true,
      ativo: true,
      categoria: { select: { nome: true } },
      variantes: { select: { estoque: true } },
    },
  });
  return NextResponse.json({ produtos });
}

export async function POST(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const analise = esquemaProdutoAdmin.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const duplicado = await prisma.produto.findUnique({ where: { slug: analise.data.slug } });
  if (duplicado) return NextResponse.json({ erro: "Já existe uma peça com este slug" }, { status: 409 });

  const produto = await salvarProduto(analise.data);
  revalidatePath("/");
  revalidatePath("/produtos");
  return NextResponse.json({ id: produto.id }, { status: 201 });
}
