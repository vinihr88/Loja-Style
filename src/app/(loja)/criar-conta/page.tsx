import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormularioCriarConta } from "@/components/conta/formulario-auth";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default async function PaginaCriarConta() {
  if (await usuarioAtual()) redirect("/conta");

  return (
    <div className="container-loja py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl">Criar conta</h1>
        <p className="mt-2 text-sm text-ardosia-500">Leva menos de um minuto.</p>
        <div className="mt-8">
          <FormularioCriarConta />
        </div>
      </div>
    </div>
  );
}
