import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="container-loja py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-ouro-600">Erro 404</p>
      <h1 className="mt-3 font-display text-4xl">Página não encontrada</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-ardosia-500">
        O endereço pode ter mudado ou a peça saiu do catálogo.
      </p>
      <Link href="/produtos" className="botao botao-principal mt-8">
        Ver o catálogo
      </Link>
    </div>
  );
}
