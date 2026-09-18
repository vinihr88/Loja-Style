// Importa fotos reais de fotos-originais/<slug>/ para public/produtos/<slug>/
// e atualiza o banco. Sem argumentos, lista os slugs disponíveis.
try {
  process.loadEnvFile();
} catch {
  // sem .env: usa as variáveis do ambiente
}

import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { extname, join } from "node:path";

const prisma = new PrismaClient();
const ORIGEM = join(process.cwd(), "fotos-originais");
const DESTINO = join(process.cwd(), "public", "produtos");
const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function principal() {
  const produtos = await prisma.produto.findMany({ select: { id: true, slug: true, nome: true }, orderBy: { slug: "asc" } });
  const pastas = existsSync(ORIGEM) ? readdirSync(ORIGEM, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];

  if (pastas.length === 0) {
    console.log("Nenhuma pasta em fotos-originais/. Crie fotos-originais/<slug>/ com as imagens.\n");
    console.log("Slugs do catálogo:");
    for (const p of produtos) console.log(`  ${p.slug}`);
    return;
  }

  let importados = 0;
  for (const slug of pastas) {
    const produto = produtos.find((p) => p.slug === slug);
    if (!produto) {
      console.warn(`- ${slug}: não existe no catálogo, ignorado`);
      continue;
    }

    const arquivos = readdirSync(join(ORIGEM, slug))
      .filter((a) => EXTENSOES.has(extname(a).toLowerCase()))
      .sort();
    if (arquivos.length === 0) continue;

    const pasta = join(DESTINO, slug);
    if (existsSync(pasta)) rmSync(pasta, { recursive: true });
    mkdirSync(pasta, { recursive: true });

    const imagens = arquivos.map((arquivo, i) => {
      const nome = `${String(i + 1).padStart(2, "0")}${extname(arquivo).toLowerCase() === ".jpeg" ? ".jpg" : extname(arquivo).toLowerCase()}`;
      copyFileSync(join(ORIGEM, slug, arquivo), join(pasta, nome));
      return { produtoId: produto.id, url: `/produtos/${slug}/${nome}`, alt: `${produto.nome} — foto ${i + 1}`, ordem: i };
    });

    await prisma.imagemProduto.deleteMany({ where: { produtoId: produto.id } });
    await prisma.imagemProduto.createMany({ data: imagens });
    console.log(`+ ${slug}: ${imagens.length} foto(s)`);
    importados += 1;
  }

  console.log(`\n${importados} peça(s) atualizada(s).`);
}

principal()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
