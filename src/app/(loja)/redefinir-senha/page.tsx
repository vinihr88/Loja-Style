import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRedefinir } from "@/components/conta/formulario-auth";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

export default async function PaginaRedefinir({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="container-loja py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl">Nova senha</h1>
        <div className="mt-8">
          {token ? (
            <FormularioRedefinir token={token} />
          ) : (
            <p className="text-sm text-ardosia-600">
              Link incompleto.{" "}
              <Link href="/recuperar-senha" className="underline underline-offset-4">
                Peça um novo
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
