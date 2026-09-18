// Ajusta o provider do schema conforme a DATABASE_URL e barra o deploy quando
// um ambiente serverless tentaria subir com SQLite — o banco sumiria no
// primeiro deploy e a loja quebraria no primeiro pedido.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CAMINHO = join(process.cwd(), "prisma", "schema.prisma");
const url = process.env.DATABASE_URL ?? "";
const serverless = Boolean(process.env.NETLIFY || process.env.VERCEL);

const postgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
const sqlite = url.startsWith("file:") || url === "";

if (serverless && sqlite) {
  console.error(
    [
      "",
      "Deploy interrompido.",
      "",
      "DATABASE_URL aponta para SQLite num ambiente serverless (Netlify/Vercel).",
      "Cada requisição roda numa função isolada e sem disco: o banco seria perdido.",
      "",
      "Configure DATABASE_URL com um Postgres (Neon, Supabase) e rode uma vez:",
      '  DATABASE_URL="postgresql://..." npm run db:deploy',
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const schema = readFileSync(CAMINHO, "utf8");
const desejado = postgres ? "postgresql" : "sqlite";
const ajustado = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${desejado}"`);

if (ajustado !== schema) {
  writeFileSync(CAMINHO, ajustado, "utf8");
  console.log(`schema.prisma ajustado para ${desejado}.`);
} else {
  console.log(`schema.prisma já está em ${desejado}.`);
}
