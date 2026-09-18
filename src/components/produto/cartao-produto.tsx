import Image from "next/image";
import Link from "next/link";
import { moeda } from "@/lib/formato";
import { emPromocao, precoFinal, temEstoque, type ProdutoCartao } from "@/lib/consultas";

export function CartaoProduto({ produto, prioridade }: { produto: ProdutoCartao; prioridade?: boolean }) {
  const preco = precoFinal(produto);
  const promocao = emPromocao(produto);
  const disponivel = temEstoque(produto);
  const capa = produto.imagens[0];
  const cores = [...new Map(produto.variantes.map((v) => [v.cor, v.corHex])).entries()];
  const desconto = promocao
    ? Math.round(((produto.precoCentavos - preco) / produto.precoCentavos) * 100)
    : 0;

  return (
    <article className="group">
      <Link href={`/produto/${produto.slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-ardosia-100">
          {capa ? (
            <Image
              src={capa.url}
              alt={capa.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={prioridade}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ardosia-400">
              sem imagem
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {promocao && (
              <span className="etiqueta bg-ardosia-900 text-areia-50">-{desconto}%</span>
            )}
            {produto.lancamento && !promocao && (
              <span className="etiqueta bg-ouro-500 text-ardosia-900">Novo</span>
            )}
          </div>

          {!disponivel && (
            <div className="absolute inset-0 flex items-center justify-center bg-areia-50/75">
              <span className="etiqueta border border-ardosia-400 text-ardosia-700">Esgotado</span>
            </div>
          )}
        </div>

        <div className="pt-3.5">
          {produto.marca && (
            <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-ardosia-400">{produto.marca}</p>
          )}
          <h3 className="mt-1 font-display text-[0.9375rem] leading-snug text-ardosia-900">
            {produto.nome}
          </h3>

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[0.9375rem] font-semibold text-ardosia-900">{moeda(preco)}</span>
            {promocao && (
              <span className="text-xs text-ardosia-400 line-through">{moeda(produto.precoCentavos)}</span>
            )}
          </div>
        </div>
      </Link>

      {cores.length > 1 && (
        <div className="mt-2 flex gap-1.5">
          {cores.map(([nome, hex]) => (
            <span
              key={nome}
              title={nome}
              className="h-3 w-3 rounded-full border border-ardosia-300"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      )}
    </article>
  );
}
