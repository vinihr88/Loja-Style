import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormularioEntrar } from "@/components/conta/formulario-auth";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ redefinida?: string }>;
}) {
  const usuario = await usuarioAtual();
  if (usuario) redirect(usuario.admin ? "/admin" : "/conta");

  const { redefinida } = await searchParams;

  return (
    <div className="container-loja py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl">Entrar</h1>
        <p className="mt-2 text-sm text-ardosia-500">Acompanhe pedidos e salve endereços.</p>
        {redefinida && (
          <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Senha alterada. Entre com a nova senha.
          </p>
        )}
        <div className="mt-8">
          <Suspense>
            <FormularioEntrar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
