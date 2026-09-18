import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLITICAS, politicaPorSlug } from "@/lib/politicas";

export function generateStaticParams() {
  return POLITICAS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const politica = politicaPorSlug(slug);
  if (!politica) return { title: "Página não encontrada" };
  return { title: politica.titulo, description: politica.resumo };
}

export default async function PaginaPolitica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const politica = politicaPorSlug(slug);
  if (!politica) notFound();

  return (
    <div className="container-loja py-10">
      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside>
          <p className="rotulo">Políticas</p>
          <ul className="space-y-2">
            {POLITICAS.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/politicas/${p.slug}`}
                  className={`text-sm ${p.slug === slug ? "font-semibold text-ardosia-900" : "text-ardosia-600 hover:text-ardosia-900"}`}
                >
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <article className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl">{politica.titulo}</h1>
          <p className="mt-3 text-[0.9375rem] text-ardosia-600">{politica.resumo}</p>

          <div className="mt-10 space-y-8">
            {politica.secoes.map((s) => (
              <section key={s.titulo}>
                <h2 className="font-display text-xl">{s.titulo}</h2>
                <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ardosia-600">
                  {s.paragrafos.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
