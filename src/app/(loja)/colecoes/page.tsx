import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Coleções",
  description: "As coleções da KAUÃ STYLE: noite de gala, conjuntos completos, verão em linho e acessórios.",
};


export default async function PaginaColecoes() {
  const colecoes = await prisma.colecao.findMany({
    orderBy: { ordem: "asc" },
    select: {
      nome: true,
      slug: true,
      descricao: true,
      produtos: { where: { ativo: true }, take: 1, select: { imagens: { take: 1, orderBy: { ordem: "asc" } } } },
      _count: { select: { produtos: { where: { ativo: true } } } },
    },
  });

  return (
    <div className="container-loja py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Coleções</h1>
      <p className="mt-2 max-w-lg text-sm text-ardosia-500">
        Peças agrupadas por ocasião e tecido. Cada coleção é curta de propósito.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colecoes.map((c) => {
          const imagem = c.produtos[0]?.imagens[0];
          return (
            <Link key={c.slug} href={`/colecoes/${c.slug}`} className="group relative block aspect-4/5 overflow-hidden bg-ardosia-800">
              {imagem && (
                <Image src={imagem.url} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ardosia-900 via-ardosia-900/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-areia-50">
                <h2 className="font-display text-xl">{c.nome}</h2>
                {c.descricao && <p className="mt-1.5 text-sm leading-snug text-ardosia-200">{c.descricao}</p>}
                <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.15em] text-ouro-400">{c._count.produtos} peças</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
