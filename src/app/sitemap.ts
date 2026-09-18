import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constantes";
import { POLITICAS } from "@/lib/politicas";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produtos, colecoes] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, select: { slug: true, atualizadoEm: true } }),
    prisma.colecao.findMany({ select: { slug: true } }),
  ]);

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/colecoes`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/guia-de-tamanhos`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/suporte`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/suporte/faq`, changeFrequency: "monthly", priority: 0.4 },
    ...POLITICAS.map((p) => ({ url: `${SITE_URL}/politicas/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];

  return [
    ...fixas,
    ...colecoes.map((c) => ({ url: `${SITE_URL}/colecoes/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...produtos.map((p) => ({
      url: `${SITE_URL}/produto/${p.slug}`,
      lastModified: p.atualizadoEm,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
