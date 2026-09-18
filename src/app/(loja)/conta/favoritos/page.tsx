import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { selecaoCartao } from "@/lib/consultas";
import { CartaoProduto } from "@/components/produto/cartao-produto";

export default async function PaginaFavoritos() {
  const usuario = await exigirUsuario();
  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: usuario.id, produto: { ativo: true } },
    orderBy: { criadoEm: "desc" },
    select: { produto: { select: selecaoCartao } },
  });

  return (
    <div>
      <h2 className="font-display text-xl">Favoritos</h2>
      {favoritos.length === 0 ? (
        <div className="mt-5 border border-dashed border-ardosia-300 px-6 py-14 text-center">
          <p className="text-sm text-ardosia-500">Toque no coração de uma peça para guardá-la aqui.</p>
          <Link href="/produtos" className="botao botao-principal mt-5">
            Ver o catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {favoritos.map((f) => (
            <CartaoProduto key={f.produto.id} produto={f.produto} />
          ))}
        </div>
      )}
    </div>
  );
}
