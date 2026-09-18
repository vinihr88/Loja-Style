import { prisma } from "@/lib/prisma";
import { Cupons } from "@/components/admin/cupons";

export default async function PaginaCupons() {
  const cupons = await prisma.cupom.findMany({ orderBy: [{ ativo: "desc" }, { criadoEm: "desc" }] });

  return (
    <div>
      <h1 className="font-display text-2xl">Cupons</h1>
      <div className="mt-6">
        <Cupons cupons={cupons.map((c) => ({ ...c, expiraEm: c.expiraEm?.toISOString() ?? null }))} />
      </div>
    </div>
  );
}
