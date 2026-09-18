import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gatewayConfigurado } from "@/lib/mercadopago";
import { BotaoSair } from "@/components/conta/botao-sair";
import { MenuAdmin } from "@/components/admin/menu-admin";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const admin = await exigirAdmin();

  const [pendentesAvaliacao, mensagensNaoLidas, aguardando] = await Promise.all([
    prisma.avaliacao.count({ where: { aprovada: false } }),
    prisma.contato.count({ where: { lida: false } }),
    prisma.pedido.count({ where: { status: "AGUARDANDO_PAGAMENTO" } }),
  ]);

  const avisos: string[] = [];
  if (!gatewayConfigurado()) avisos.push("MERCADOPAGO_ACCESS_TOKEN não configurado: pagamentos online desligados; pedidos ficam aguardando confirmação manual.");
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET && gatewayConfigurado()) avisos.push("MERCADOPAGO_WEBHOOK_SECRET vazio: assinatura do webhook não é validada.");
  if (!process.env.RESEND_API_KEY) avisos.push("RESEND_API_KEY vazio: e-mails transacionais desligados; link de recuperação sai no log do servidor.");

  return (
    <div className="flex min-h-screen bg-areia-50">
      <MenuAdmin
        contadores={{ avaliacoes: pendentesAvaliacao, mensagens: mensagensNaoLidas, pedidos: aguardando }}
        nome={admin.nome}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-ardosia-200 bg-white px-5 lg:px-8">
          <p className="text-xs uppercase tracking-[0.15em] text-ardosia-500 lg:hidden">Painel</p>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/" className="text-ardosia-600 hover:text-ardosia-900">
              Ver loja
            </Link>
            <BotaoSair />
          </div>
        </header>

        {avisos.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-900 lg:px-8">
            <ul className="space-y-1">
              {avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <main className="flex-1 px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
