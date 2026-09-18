import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarTokenRecuperacao } from "@/lib/auth";
import { esquemaRecuperar, primeiroErro } from "@/lib/validacoes";
import { ipDaRequisicao, limitar } from "@/lib/limite";
import { SITE_URL } from "@/lib/constantes";

// Sem serviço de e-mail configurado, o link é registrado no log do servidor.
// Resposta idêntica para e-mail cadastrado ou não.
export async function POST(req: Request) {
  if (!limitar(`recuperar:${ipDaRequisicao(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde." }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const analise = esquemaRecuperar.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json({ erro: primeiroErro(analise.error) }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: analise.data.email } });

  if (usuario) {
    const { token, hash } = gerarTokenRecuperacao();
    await prisma.tokenRecuperacao.create({
      data: { tokenHash: hash, usuarioId: usuario.id, expiraEm: new Date(Date.now() + 60 * 60_000) },
    });

    const link = `${SITE_URL}/redefinir-senha?token=${token}`;
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "KAUÃ STYLE <nao-responda@kauastyle.com.br>",
          to: usuario.email,
          subject: "Redefinir sua senha",
          text: `Para criar uma nova senha, acesse: ${link}\n\nO link vale por 1 hora e só pode ser usado uma vez.`,
        }),
      }).catch(() => null);
    } else {
      console.log(`[recuperar-senha] ${usuario.email}: ${link}`);
    }
  }

  return NextResponse.json({ ok: true });
}
