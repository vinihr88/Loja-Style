import { NextResponse } from "next/server";
import { adminDaApi } from "@/lib/auth";
import { esquemaStatusPedido, primeiroErro } from "@/lib/validacoes";
import { atualizarStatus } from "@/lib/pedidos";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminDaApi();
  if (!admin) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const analise = esquemaStatusPedido.safeParse(await req.json().catch(() => null));
  if (!analise.success) return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });

  const resultado = await atualizarStatus({
    pedidoId: id,
    status: analise.data.status,
    rastreioCodigo: analise.data.rastreioCodigo,
    observacao: analise.data.observacao,
    autor: admin.nome,
  });

  if (!resultado.ok) return NextResponse.json({ erro: resultado.motivo }, { status: 404 });
  return NextResponse.json({ ok: true });
}
