import { exigirUsuario } from "@/lib/auth";
import { FormularioPerfil } from "@/components/conta/formulario-perfil";

export default async function PaginaConta() {
  const usuario = await exigirUsuario();

  return (
    <div>
      <h2 className="font-display text-xl">Seus dados</h2>
      <div className="mt-5">
        <FormularioPerfil nome={usuario.nome} email={usuario.email} telefone={usuario.telefone} />
      </div>
    </div>
  );
}
