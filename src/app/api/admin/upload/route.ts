import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { adminDaApi } from "@/lib/auth";

const LIMITE = 8 * 1024 * 1024;

// O tipo declarado pelo navegador não vale: a extensão sai dos primeiros bytes.
function extensaoPelaAssinatura(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

// Grava em disco (public/produtos/<slug>). Em serverless, trocar por bucket.
export async function POST(req: Request) {
  if (!(await adminDaApi())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const formulario = await req.formData().catch(() => null);
  if (!formulario) return NextResponse.json({ erro: "Envio inválido" }, { status: 400 });

  const slugBruto = String(formulario.get("slug") ?? "");
  const slug = slugBruto.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug || slug.length < 3) return NextResponse.json({ erro: "Slug inválido" }, { status: 400 });

  const arquivos = formulario.getAll("arquivos").filter((a): a is File => a instanceof File);
  if (arquivos.length === 0) return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  if (arquivos.length > 12) return NextResponse.json({ erro: "Máximo de 12 fotos por vez" }, { status: 400 });

  const pasta = join(process.cwd(), "public", "produtos", slug);
  await mkdir(pasta, { recursive: true });

  const urls: string[] = [];
  for (const arquivo of arquivos) {
    if (arquivo.size > LIMITE) return NextResponse.json({ erro: `${arquivo.name} passa de 8 MB` }, { status: 400 });

    const conteudo = Buffer.from(await arquivo.arrayBuffer());
    const extensao = extensaoPelaAssinatura(conteudo);
    if (!extensao) return NextResponse.json({ erro: `Formato não aceito: ${arquivo.name} (só JPG, PNG e WebP)` }, { status: 400 });

    const nome = `${Date.now()}-${randomBytes(4).toString("hex")}.${extensao}`;
    await writeFile(join(pasta, nome), conteudo);
    urls.push(`/produtos/${slug}/${nome}`);
  }

  return NextResponse.json({ urls });
}
