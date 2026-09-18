import type { Metadata } from "next";
import Link from "next/link";
import { WHATSAPP } from "@/lib/constantes";
import { FormularioContato } from "@/components/loja/formulario-contato";
import { IconeWhatsapp } from "@/components/ui/icones";

export const metadata: Metadata = {
  title: "Suporte",
  description: "Fale com a KAUÃ STYLE pelo WhatsApp ou pelo formulário. Respondemos em até 1 dia útil.",
};

export default function PaginaSuporte() {
  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Suporte</h1>
      <p className="mt-2 max-w-lg text-sm text-ardosia-500">
        Dúvida de tamanho, pedido ou troca: o caminho mais rápido é o WhatsApp.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[20rem_1fr]">
        <aside className="space-y-4">
          {WHATSAPP && (
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border border-ardosia-200 bg-white p-5 transition-colors hover:border-ardosia-900"
            >
              <IconeWhatsapp className="h-7 w-7 text-green-600" />
              <span>
                <span className="block text-sm font-semibold">WhatsApp</span>
                <span className="block text-xs text-ardosia-500">resposta em minutos no horário comercial</span>
              </span>
            </a>
          )}
          <Link href="/rastreio" className="block border border-ardosia-200 bg-white p-5 transition-colors hover:border-ardosia-900">
            <span className="block text-sm font-semibold">Rastrear pedido</span>
            <span className="block text-xs text-ardosia-500">número do pedido + e-mail</span>
          </Link>
          <Link href="/suporte/faq" className="block border border-ardosia-200 bg-white p-5 transition-colors hover:border-ardosia-900">
            <span className="block text-sm font-semibold">Perguntas frequentes</span>
            <span className="block text-xs text-ardosia-500">tamanhos, prazos, trocas e pagamento</span>
          </Link>
          <Link href="/politicas/trocas-e-devolucoes" className="block border border-ardosia-200 bg-white p-5 transition-colors hover:border-ardosia-900">
            <span className="block text-sm font-semibold">Trocas e devoluções</span>
            <span className="block text-xs text-ardosia-500">7 dias para desistir, 30 para defeito</span>
          </Link>
        </aside>

        <section>
          <h2 className="font-display text-xl">Enviar mensagem</h2>
          <div className="mt-5 max-w-xl">
            <FormularioContato />
          </div>
        </section>
      </div>
    </div>
  );
}
