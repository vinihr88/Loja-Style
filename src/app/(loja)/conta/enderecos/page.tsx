import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { Enderecos } from "@/components/conta/enderecos";

export default async function PaginaEnderecos() {
  const usuario = await exigirUsuario();
  const enderecos = await prisma.endereco.findMany({
    where: { usuarioId: usuario.id },
    orderBy: [{ padrao: "desc" }, { apelido: "asc" }],
  });

  return (
    <div>
      <h2 className="font-display text-xl">Endereços</h2>
      <div className="mt-5">
        <Enderecos enderecos={enderecos} nomeUsuario={usuario.nome} />
      </div>
    </div>
  );
}
