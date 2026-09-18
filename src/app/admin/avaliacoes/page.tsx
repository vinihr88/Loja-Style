import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dataHora } from "@/lib/formato";
import { Estrelas } from "@/components/produto/avaliacoes";
import { AcoesAvaliacao } from "@/components/admin/acoes-avaliacao";

export default async function PaginaAvaliacoesAdmin() {
  const avaliacoes = await prisma.avaliacao.findMany({
    orderBy: [{ aprovada: "asc" }, { criadoEm: "desc" }],
    take: 200,
    include: { produto: { select: { nome: true, slug: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">Avaliações</h1>
      <p className="mt-1 text-sm text-ardosia-500">Só avaliações aprovadas aparecem no site.</p>

      <ul className="mt-6 space-y-3">
        {avaliacoes.map((a) => (
          <li key={a.id} className={`border bg-white p-5 ${a.aprovada ? "border-ardosia-200" : "border-ouro-500"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/produto/${a.produto.slug}`} className="text-xs uppercase tracking-[0.1em] text-ardosia-500 underline-offset-2 hover:underline">
                  {a.produto.nome}
                </Link>
                <div className="mt-1 flex items-center gap-3">
                  <Estrelas nota={a.nota} className="h-3.5 w-3.5" />
                  <span className="text-sm font-semibold">{a.nome}</span>
                  <span className="text-xs text-ardosia-400">{dataHora(a.criadoEm)}</span>
                  {!a.aprovada && <span className="etiqueta bg-ouro-500 text-ardosia-900">pendente</span>}
                </div>
              </div>
              <AcoesAvaliacao id={a.id} aprovada={a.aprovada} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ardosia-700">{a.comentario}</p>
          </li>
        ))}
        {avaliacoes.length === 0 && <li className="text-sm text-ardosia-500">Nenhuma avaliação ainda.</li>}
      </ul>
    </div>
  );
}
