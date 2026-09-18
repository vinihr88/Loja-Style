import type { Metadata } from "next";
import { FormularioRecuperar } from "@/components/conta/formulario-auth";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function PaginaRecuperar() {
  return (
    <div className="container-loja py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl">Recuperar senha</h1>
        <p className="mt-2 text-sm text-ardosia-500">Enviamos um link de uso único para o seu e-mail.</p>
        <div className="mt-8">
          <FormularioRecuperar />
        </div>
      </div>
    </div>
  );
}
