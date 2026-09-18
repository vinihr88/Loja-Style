import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notaMedia, produtoPorSlug, relacionados } from "@/lib/consultas";
import { moeda } from "@/lib/formato";
import { SITE_URL, WHATSAPP } from "@/lib/constantes";
import { FRETE_GRATIS_ACIMA_DE } from "@/lib/frete";
import { Galeria } from "@/components/produto/galeria";
import { Compra } from "@/components/produto/compra";
import { Avaliacoes, Estrelas } from "@/components/produto/avaliacoes";
import { CartaoProduto } from "@/components/produto/cartao-produto";
import { BotaoFavorito } from "@/components/produto/botao-favorito";
import { IconeCaminhao, IconeEscudo, IconeTroca } from "@/components/ui/icones";
import { DadosEstruturados } from "@/components/ui/dados-estruturados";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produto = await produtoPorSlug(slug);
  if (!produto) return { title: "Peça não encontrada" };

  const imagem = produto.imagens[0]?.url;

  return {
    title: produto.nome,
    description: produto.resumo,
    alternates: { canonical: `/produto/${produto.slug}` },
    openGraph: {
      title: produto.nome,
      description: produto.resumo,
      url: `${SITE_URL}/produto/${produto.slug}`,
      images: imagem ? [{ url: imagem }] : undefined,
      type: "website",
    },
  };
}

export default async function PaginaProduto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await produtoPorSlug(slug);
  if (!produto) notFound();

  const [nota, semelhantes] = await Promise.all([
    notaMedia(produto.id),
    relacionados(produto.id, produto.categoriaId),
  ]);

  const preco = produto.precoPromocionalCentavos ?? produto.precoCentavos;
  const disponivel = produto.variantes.some((v) => v.estoque > 0);
  const faltaParaFreteGratis = Math.max(FRETE_GRATIS_ACIMA_DE - preco, 0);

  const dadosEstruturados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.nome,
    description: produto.resumo,
    sku: produto.variantes[0]?.sku,
    brand: { "@type": "Brand", name: produto.marca ?? "KAUÃ STYLE" },
    image: produto.imagens.map((i) => `${SITE_URL}${i.url}`),
    offers: {
      "@type": "Offer",
      price: (preco / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: disponivel ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/produto/${produto.slug}`,
    },
    ...(nota.quantidade > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: nota.media.toFixed(1),
            reviewCount: nota.quantidade,
          },
        }
      : {}),
  };

  return (
    <div className="container-loja py-8">
      <DadosEstruturados dados={dadosEstruturados} />

      <nav className="mb-7 flex flex-wrap items-center gap-1.5 text-xs text-ardosia-500">
        <Link href="/" className="hover:text-ardosia-900">
          Início
        </Link>
        <span>/</span>
        <Link href={`/produtos?categoria=${produto.categoria.slug}`} className="hover:text-ardosia-900">
          {produto.categoria.nome}
        </Link>
        <span>/</span>
        <span className="text-ardosia-700">{produto.nome}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Galeria imagens={produto.imagens} nome={produto.nome} />

        <div>
          {produto.marca && (
            <p className="text-xs uppercase tracking-[0.15em] text-ardosia-400">{produto.marca}</p>
          )}
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">{produto.nome}</h1>
            <BotaoFavorito produtoId={produto.id} />
          </div>

          {nota.quantidade > 0 && (
            <a href="#avaliacoes" className="mt-3 flex items-center gap-2 text-sm text-ardosia-600">
              <Estrelas nota={nota.media} className="h-4 w-4" />
              <span className="underline underline-offset-2">
                {nota.quantidade} {nota.quantidade === 1 ? "avaliação" : "avaliações"}
              </span>
            </a>
          )}

          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ardosia-600">{produto.resumo}</p>

          <Compra
            produtoNome={produto.nome}
            produtoSlug={produto.slug}
            imagemUrl={produto.imagens[0]?.url ?? null}
            precoCentavos={preco}
            precoCheioCentavos={produto.precoCentavos}
            variantes={produto.variantes.map((v) => ({
              id: v.id,
              tamanho: v.tamanho,
              cor: v.cor,
              corHex: v.corHex,
              estoque: v.estoque,
            }))}
            whatsapp={WHATSAPP}
          />

          <ul className="mt-8 space-y-3 border-t border-ardosia-200 pt-7 text-sm text-ardosia-600">
            <li className="flex items-start gap-2.5">
              <IconeCaminhao className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ouro-600" />
              {faltaParaFreteGratis > 0 ? (
                <span>
                  Faltam {moeda(faltaParaFreteGratis)} para o frete grátis na entrega padrão.
                </span>
              ) : (
                <span>Frete grátis na entrega padrão para todo o Brasil.</span>
              )}
            </li>
            <li className="flex items-start gap-2.5">
              <IconeTroca className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ouro-600" />
              <span>Primeira troca de tamanho por nossa conta, em até 7 dias.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconeEscudo className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ouro-600" />
              <span>Pagamento pelo Mercado Pago. Nenhum dado de cartão passa pela loja.</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="mt-16 grid gap-10 border-t border-ardosia-200 pt-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="font-display text-xl">Sobre a peça</h2>
          <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-ardosia-600">
            {produto.descricao.split("\n\n").map((paragrafo) => (
              <p key={paragrafo.slice(0, 32)}>{paragrafo}</p>
            ))}
          </div>
        </div>

        <aside className="border border-ardosia-200 bg-white p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ardosia-500">
            Ficha rápida
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ardosia-500">Categoria</dt>
              <dd className="text-right text-ardosia-900">{produto.categoria.nome}</dd>
            </div>
            {produto.marca && (
              <div className="flex justify-between gap-4">
                <dt className="text-ardosia-500">Marca</dt>
                <dd className="text-right text-ardosia-900">{produto.marca}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-ardosia-500">Tamanhos</dt>
              <dd className="text-right text-ardosia-900">
                {[...new Set(produto.variantes.map((v) => v.tamanho))].join(" · ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ardosia-500">Cores</dt>
              <dd className="text-right text-ardosia-900">
                {[...new Set(produto.variantes.map((v) => v.cor))].join(" · ")}
              </dd>
            </div>
          </dl>

          {produto.colecoes.length > 0 && (
            <div className="mt-5 border-t border-ardosia-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ardosia-500">
                Nas coleções
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {produto.colecoes.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/colecoes/${c.slug}`}
                    className="etiqueta border border-ardosia-200 text-ardosia-700 hover:border-ardosia-500"
                  >
                    {c.nome}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <section id="avaliacoes" className="mt-16 border-t border-ardosia-200 pt-12">
        <h2 className="font-display text-xl">Avaliações</h2>
        <div className="mt-6">
          <Avaliacoes
            produtoId={produto.id}
            media={nota.media}
            avaliacoes={produto.avaliacoes.map((a) => ({
              id: a.id,
              nome: a.nome,
              nota: a.nota,
              comentario: a.comentario,
              criadoEm: a.criadoEm.toISOString(),
            }))}
          />
        </div>
      </section>

      {semelhantes.length > 0 && (
        <section className="mt-16 border-t border-ardosia-200 pt-12">
          <h2 className="font-display text-xl">Combina com</h2>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {semelhantes.map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
