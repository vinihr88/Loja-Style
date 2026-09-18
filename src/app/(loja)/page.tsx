import Image from "next/image";
import Link from "next/link";
import { vitrine } from "@/lib/consultas";
import { CartaoProduto } from "@/components/produto/cartao-produto";
import { IconeCaminhao, IconeEscudo, IconeTroca, IconeWhatsapp } from "@/components/ui/icones";
import { INSTAGRAM, WHATSAPP } from "@/lib/constantes";


export default async function PaginaInicial() {
  const { destaques, lancamentos, promocoes, colecoes } = await vitrine();
  const capa = destaques[0]?.imagens[0] ?? lancamentos[0]?.imagens[0];

  return (
    <>
      <section className="relative overflow-hidden bg-ardosia-900 text-areia-50">
        <div className="container-loja grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-[0.6875rem] uppercase tracking-[0.25em] text-ouro-500">
              Coleção atual
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Peça certa,
              <br />
              caimento certo.
            </h1>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ardosia-300">
              Conjuntos, camisetas e jaquetas escolhidos um a um. Sem catálogo infinito: só o que a
              gente vestiria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/produtos" className="botao botao-ouro">
                Ver o catálogo
              </Link>
              <Link
                href="/colecoes"
                className="botao border border-ardosia-600 text-areia-50 hover:border-ouro-500"
              >
                Coleções
              </Link>
            </div>
          </div>

          {capa && (
            <div className="relative mx-auto aspect-3/4 w-full max-w-sm">
              <div className="absolute -inset-3 border border-ardosia-600" aria-hidden />
              <Image
                src={capa.url}
                alt={capa.alt}
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                priority
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-ardosia-200 bg-areia-100">
        <div className="container-loja grid gap-6 py-7 sm:grid-cols-3">
          {[
            { Icone: IconeCaminhao, titulo: "Frete grátis", texto: "Acima de R$ 399 na entrega padrão" },
            { Icone: IconeTroca, titulo: "Primeira troca grátis", texto: "Errou o tamanho? A gente resolve" },
            { Icone: IconeEscudo, titulo: "Pagamento seguro", texto: "Mercado Pago · Pix, cartão e boleto" },
          ].map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="flex items-start gap-3">
              <Icone className="mt-0.5 h-5 w-5 shrink-0 text-ouro-600" />
              <div>
                <p className="text-sm font-semibold text-ardosia-900">{titulo}</p>
                <p className="text-xs text-ardosia-500">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="container-loja py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="titulo-secao linha-ouro">Destaques da loja</h2>
            </div>
            <Link
              href="/produtos"
              className="hidden text-sm text-ardosia-600 underline-offset-4 hover:text-ardosia-900 hover:underline sm:block"
            >
              Ver tudo
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {destaques.slice(0, 8).map((p, i) => (
              <CartaoProduto key={p.id} produto={p} prioridade={i < 2} />
            ))}
          </div>
        </section>
      )}

      {colecoes.length > 0 && (
        <section className="bg-areia-100 py-16">
          <div className="container-loja">
            <h2 className="titulo-secao linha-ouro">Coleções</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {colecoes.map((colecao) => {
                const imagem = colecao.produtos[0]?.imagens[0];
                return (
                  <Link
                    key={colecao.slug}
                    href={`/colecoes/${colecao.slug}`}
                    className="group relative block aspect-4/5 overflow-hidden bg-ardosia-800"
                  >
                    {imagem && (
                      <Image
                        src={imagem.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ardosia-900 via-ardosia-900/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-areia-50">
                      <h3 className="font-display text-xl">{colecao.nome}</h3>
                      {colecao.descricao && (
                        <p className="mt-1.5 text-sm leading-snug text-ardosia-200">{colecao.descricao}</p>
                      )}
                      <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.15em] text-ouro-400">
                        {colecao._count.produtos} peças
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {promocoes.length > 0 && (
        <section className="container-loja py-16">
          <h2 className="titulo-secao linha-ouro">Preço reduzido</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {promocoes.slice(0, 4).map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      {lancamentos.length > 0 && (
        <section className="container-loja pb-16">
          <h2 className="titulo-secao linha-ouro">Chegou agora</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {lancamentos.slice(0, 4).map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-ardosia-200 bg-areia-100 py-16">
        <div className="container-loja grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="titulo-secao linha-ouro">Dúvida no tamanho?</h2>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ardosia-600">
              Manda mensagem com sua altura e peso que a gente indica o tamanho certo antes de você
              comprar. Respondemos rápido, de verdade.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="botao botao-principal"
                >
                  <IconeWhatsapp className="h-4 w-4" />
                  Chamar no WhatsApp
                </a>
              )}
              <Link href="/guia-de-tamanhos" className="botao botao-contorno">
                Ver guia de tamanhos
              </Link>
            </div>
          </div>

          {INSTAGRAM && (
            <div className="border border-ardosia-200 bg-white p-7">
              <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-ouro-600">Instagram</p>
              <p className="mt-2 font-display text-2xl">@{INSTAGRAM}</p>
              <p className="mt-3 text-sm leading-relaxed text-ardosia-600">
                Todo look que sai daqui aparece por lá primeiro. Peças novas toda semana.
              </p>
              <a
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-semibold text-ardosia-900 underline underline-offset-4"
              >
                Seguir a loja
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
