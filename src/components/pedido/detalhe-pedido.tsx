import Image from "next/image";
import Link from "next/link";
import { LINHA_DO_TEMPO, ROTULO_STATUS, STATUS_PEDIDO, WHATSAPP } from "@/lib/constantes";
import { dataHora, moeda } from "@/lib/formato";
import { IconeWhatsapp } from "@/components/ui/icones";

export type PedidoDetalhado = {
  numero: string;
  status: string;
  criadoEm: Date;
  nome: string;
  email: string;
  subtotalCentavos: number;
  descontoCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
  cupomCodigo: string | null;
  envioMetodo: string;
  envioPrazoDias: number;
  cep: string;
  logradouro: string;
  numero_: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  rastreioCodigo: string | null;
  pagamentoMetodo: string | null;
  itens: {
    id: string;
    produtoNome: string;
    produtoSlug: string;
    tamanho: string;
    cor: string;
    imagemUrl: string | null;
    precoCentavos: number;
    quantidade: number;
  }[];
  eventos: { id: string; status: string; descricao: string; criadoEm: Date }[];
};

const NOME_ENVIO: Record<string, string> = {
  PAC: "Entrega padrão",
  SEDEX: "Entrega expressa",
  RETIRADA: "Retirada com a loja",
};

export function corDoStatus(status: string): string {
  switch (status) {
    case STATUS_PEDIDO.PAGO:
    case STATUS_PEDIDO.EM_SEPARACAO:
      return "bg-blue-50 text-blue-800 border-blue-200";
    case STATUS_PEDIDO.ENVIADO:
      return "bg-amber-50 text-amber-800 border-amber-200";
    case STATUS_PEDIDO.ENTREGUE:
      return "bg-green-50 text-green-800 border-green-200";
    case STATUS_PEDIDO.CANCELADO:
      return "bg-red-50 text-red-800 border-red-200";
    default:
      return "bg-ardosia-100 text-ardosia-700 border-ardosia-200";
  }
}

export function LinhaDoTempo({ status, eventos }: { status: string; eventos: PedidoDetalhado["eventos"] }) {
  const cancelado = status === STATUS_PEDIDO.CANCELADO;
  const indiceAtual = LINHA_DO_TEMPO.indexOf(status);

  return (
    <div>
      {!cancelado && (
        <ol className="flex items-start justify-between gap-1">
          {LINHA_DO_TEMPO.map((etapa, i) => {
            const feita = i <= indiceAtual;
            return (
              <li key={etapa} className="flex flex-1 flex-col items-center text-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    feita ? "border-ardosia-900 bg-ardosia-900 text-areia-50" : "border-ardosia-300 text-ardosia-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`mt-2 text-[0.6875rem] leading-tight ${feita ? "text-ardosia-900" : "text-ardosia-400"}`}>
                  {ROTULO_STATUS[etapa]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <ul className="mt-6 space-y-3 border-l border-ardosia-200 pl-4">
        {eventos.map((e) => (
          <li key={e.id} className="relative text-sm">
            <span className="absolute -left-[1.3125rem] top-1.5 h-2 w-2 rounded-full bg-ouro-500" />
            <p className="text-ardosia-800">{e.descricao}</p>
            <p className="text-xs text-ardosia-400">{dataHora(e.criadoEm)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DetalhePedido({ pedido, modoAdmin = false }: { pedido: PedidoDetalhado; modoAdmin?: boolean }) {
  const aguardando = pedido.status === STATUS_PEDIDO.AGUARDANDO_PAGAMENTO;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-10">
        {aguardando && !modoAdmin && (
          <div className="border border-ouro-500 bg-areia-100 p-5">
            <p className="font-display text-lg">Pagamento pendente</p>
            <p className="mt-2 text-sm leading-relaxed text-ardosia-600">
              Seu pedido está registrado. Se você fechou a tela do pagamento ou prefere Pix direto,
              fale com a gente informando o número <strong>{pedido.numero}</strong>.
            </p>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero pagar o pedido ${pedido.numero}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="botao botao-principal mt-4"
              >
                <IconeWhatsapp className="h-4 w-4" />
                Combinar pagamento
              </a>
            )}
          </div>
        )}

        <section>
          <h2 className="font-display text-lg">Andamento</h2>
          <div className="mt-5">
            <LinhaDoTempo status={pedido.status} eventos={pedido.eventos} />
          </div>
          {pedido.rastreioCodigo && (
            <p className="mt-5 border border-ardosia-200 bg-white px-4 py-3 text-sm">
              Código de rastreio: <strong className="font-mono">{pedido.rastreioCodigo}</strong>
            </p>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg">Peças</h2>
          <ul className="mt-4 divide-y divide-ardosia-200 border-y border-ardosia-200">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative aspect-3/4 w-16 shrink-0 bg-ardosia-100">
                  {item.imagemUrl && (
                    <Image src={item.imagemUrl} alt={item.produtoNome} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/produto/${item.produtoSlug}`} className="font-display text-base">
                    {item.produtoNome}
                  </Link>
                  <p className="mt-0.5 text-xs text-ardosia-500">
                    {item.cor} · Tamanho {item.tamanho} · {item.quantidade}un
                  </p>
                </div>
                <span className="text-sm font-semibold">{moeda(item.precoCentavos * item.quantidade)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="border border-ardosia-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-ardosia-500">Pedido</p>
          <p className="mt-1 font-mono text-lg">{pedido.numero}</p>
          <p className="text-xs text-ardosia-400">{dataHora(pedido.criadoEm)}</p>
          <span className={`etiqueta mt-3 border ${corDoStatus(pedido.status)}`}>
            {ROTULO_STATUS[pedido.status] ?? pedido.status}
          </span>
        </div>

        <div className="border border-ardosia-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-ardosia-500">Valores</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ardosia-500">Subtotal</dt>
              <dd>{moeda(pedido.subtotalCentavos)}</dd>
            </div>
            {pedido.descontoCentavos > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Cupom {pedido.cupomCodigo}</dt>
                <dd>−{moeda(pedido.descontoCentavos)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ardosia-500">Frete</dt>
              <dd>{pedido.freteCentavos === 0 ? "grátis" : moeda(pedido.freteCentavos)}</dd>
            </div>
            <div className="flex justify-between border-t border-ardosia-200 pt-2 font-display text-base">
              <dt>Total</dt>
              <dd>{moeda(pedido.totalCentavos)}</dd>
            </div>
          </dl>
          {pedido.pagamentoMetodo && (
            <p className="mt-3 text-xs text-ardosia-400">Pagamento: {pedido.pagamentoMetodo}</p>
          )}
        </div>

        <div className="border border-ardosia-200 bg-white p-5 text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-ardosia-500">Entrega</p>
          <p className="mt-2 font-medium">{NOME_ENVIO[pedido.envioMetodo] ?? pedido.envioMetodo}</p>
          <p className="text-xs text-ardosia-500">
            prazo de {pedido.envioPrazoDias} {pedido.envioPrazoDias === 1 ? "dia útil" : "dias úteis"} após postagem
          </p>
          <address className="mt-3 not-italic leading-relaxed text-ardosia-700">
            {pedido.nome}
            <br />
            {pedido.logradouro}, {pedido.numero_}
            {pedido.complemento ? ` — ${pedido.complemento}` : ""}
            <br />
            {pedido.bairro} · {pedido.cidade}/{pedido.uf}
            <br />
            CEP {pedido.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
          </address>
          {modoAdmin && <p className="mt-2 text-xs text-ardosia-500">{pedido.email}</p>}
        </div>
      </aside>
    </div>
  );
}
