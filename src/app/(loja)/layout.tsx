import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { ProvedorCarrinho } from "@/components/carrinho/contexto";
import { Cabecalho } from "@/components/loja/cabecalho";
import { Rodape } from "@/components/loja/rodape";

export default async function LayoutLoja({ children }: { children: React.ReactNode }) {
  const [categorias, usuario] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { ordem: "asc" }, select: { nome: true, slug: true } }),
    usuarioAtual(),
  ]);

  return (
    <ProvedorCarrinho>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<div className="h-[6.5rem] border-b border-ardosia-200" />}>
          <Cabecalho
            categorias={categorias}
            usuario={usuario ? { nome: usuario.nome, admin: usuario.admin } : null}
          />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Rodape categorias={categorias} />
      </div>
    </ProvedorCarrinho>
  );
}
