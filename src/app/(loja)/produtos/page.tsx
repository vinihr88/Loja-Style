import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { facetas, listarProdutos, type FiltrosCatalogo } from "@/lib/consultas";
import { CartaoProduto } from "@/components/produto/cartao-produto";
import { Filtros } from "@/components/produto/filtros";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todas as peças da KAUÃ STYLE: conjuntos, camisetas, jaquetas, calças e acessórios.",
};

type Parametros = Promise<Record<string, string | string[] | undefined>>;

function lista(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function texto(valor: string | string[] | undefined): string | undefined {
  if (!valor) return undefined;
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function PaginaProdutos({ searchParams }: { searchParams: Parametros }) {
  const p = await searchParams;

  const filtros: FiltrosCatalogo = {
    busca: texto(p.busca),
    categoria: texto(p.categoria),
    tamanhos: lista(p.tamanho),
    cores: lista(p.cor),
    promocao: texto(p.promocao) === "1",
    disponivel: texto(p.disponivel) === "1",
    ordem: (texto(p.ordem) as FiltrosCatalogo["ordem"]) ?? "relevancia",
    pagina: Number(texto(p.pagina) ?? 1) || 1,
  };

  const [resultado, opcoes] = await Promise.all([listarProdutos(filtros), facetas()]);
  const consulta = new URLSearchParams();
  for (const [chave, valor] of Object.entries(p)) {
    if (chave === "pagina" || valor === undefined) continue;
    for (const v of Array.isArray(valor) ? valor : [valor]) consulta.append(chave, v);
  }

  return (
    <div className="container-loja py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">
          {filtros.busca ? `Busca: ${filtros.busca}` : "Catálogo"}
        </h1>
        <p className="mt-2 text-sm text-ardosia-500">
          {resultado.total} {resultado.total === 1 ? "peça encontrada" : "peças encontradas"}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
        <aside>
          <Suspense fallback={<div className="h-10" />}>
            <Filtros facetas={opcoes} total={resultado.total} />
          </Suspense>
        </aside>

        <div>
          {resultado.produtos.length === 0 ? (
            <div className="border border-dashed border-ardosia-300 px-6 py-16 text-center">
              <p className="font-display text-xl">Nada encontrado por aqui</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ardosia-500">
                Tente remover algum filtro ou buscar por outro termo.
              </p>
              <Link href="/produtos" className="botao botao-principal mt-6">
                Ver todo o catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {resultado.produtos.map((produto, i) => (
                <CartaoProduto key={produto.id} produto={produto} prioridade={i < 3} />
              ))}
            </div>
          )}

          {resultado.paginas > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
              {Array.from({ length: resultado.paginas }, (_, i) => i + 1).map((numero) => {
                const parametros = new URLSearchParams(consulta.toString());
                if (numero > 1) parametros.set("pagina", String(numero));
                const atual = numero === resultado.pagina;
                return (
                  <Link
                    key={numero}
                    href={`/produtos?${parametros.toString()}`}
                    aria-current={atual ? "page" : undefined}
                    className={`flex h-9 min-w-9 items-center justify-center border px-2 text-sm transition-colors ${
                      atual
                        ? "border-ardosia-900 bg-ardosia-900 text-areia-50"
                        : "border-ardosia-200 text-ardosia-700 hover:border-ardosia-500"
                    }`}
                  >
                    {numero}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
