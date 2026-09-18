import Link from "next/link";
import { INSTAGRAM, NOME_LOJA, WHATSAPP } from "@/lib/constantes";
import { POLITICAS } from "@/lib/politicas";
import { IconeInstagram, IconeWhatsapp } from "@/components/ui/icones";

export function Rodape({ categorias }: { categorias: { nome: string; slug: string }[] }) {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ardosia-200 bg-ardosia-900 text-areia-100">
      <div className="container-loja grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl tracking-[0.3em]">
            KAUÃ<span className="text-ouro-500">.</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ardosia-300">
            Streetwear selecionado peça a peça. Atendimento direto, envio para todo o Brasil e troca
            de tamanho por nossa conta.
          </p>
          <div className="mt-5 flex gap-3">
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-ardosia-600 text-areia-100 transition-colors hover:border-ouro-500 hover:text-ouro-400"
                aria-label="Falar no WhatsApp"
              >
                <IconeWhatsapp className="h-4.5 w-4.5" />
              </a>
            )}
            {INSTAGRAM && (
              <a
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-ardosia-600 text-areia-100 transition-colors hover:border-ouro-500 hover:text-ouro-400"
                aria-label="Instagram da loja"
              >
                <IconeInstagram className="h-4.5 w-4.5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ouro-500">Catálogo</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ardosia-300">
            <li>
              <Link href="/produtos" className="transition-colors hover:text-areia-50">
                Todas as peças
              </Link>
            </li>
            {categorias.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/produtos?categoria=${c.slug}`} className="transition-colors hover:text-areia-50">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ouro-500">Ajuda</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ardosia-300">
            <li>
              <Link href="/rastreio" className="transition-colors hover:text-areia-50">
                Rastrear pedido
              </Link>
            </li>
            <li>
              <Link href="/guia-de-tamanhos" className="transition-colors hover:text-areia-50">
                Guia de tamanhos
              </Link>
            </li>
            <li>
              <Link href="/suporte/faq" className="transition-colors hover:text-areia-50">
                Perguntas frequentes
              </Link>
            </li>
            <li>
              <Link href="/suporte" className="transition-colors hover:text-areia-50">
                Falar com a loja
              </Link>
            </li>
            <li>
              <Link href="/conta/pedidos" className="transition-colors hover:text-areia-50">
                Meus pedidos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ouro-500">Políticas</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ardosia-300">
            {POLITICAS.map((p) => (
              <li key={p.slug}>
                <Link href={`/politicas/${p.slug}`} className="transition-colors hover:text-areia-50">
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ardosia-700">
        <div className="container-loja flex flex-col gap-2 py-6 text-xs text-ardosia-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {NOME_LOJA}. Todos os direitos reservados.
          </p>
          <p>Pagamento processado pelo Mercado Pago. Nenhum dado de cartão passa por esta loja.</p>
        </div>
      </div>
    </footer>
  );
}
