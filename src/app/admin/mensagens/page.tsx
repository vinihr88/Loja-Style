import { prisma } from "@/lib/prisma";
import { dataHora } from "@/lib/formato";
import { MarcarLida } from "@/components/admin/marcar-lida";

export default async function PaginaMensagens() {
  const mensagens = await prisma.contato.findMany({ orderBy: [{ lida: "asc" }, { criadoEm: "desc" }], take: 200 });

  return (
    <div>
      <h1 className="font-display text-2xl">Mensagens</h1>
      <p className="mt-1 text-sm text-ardosia-500">Enviadas pelo formulário de suporte.</p>

      <ul className="mt-6 space-y-3">
        {mensagens.map((m) => (
          <li key={m.id} className={`border bg-white p-5 ${m.lida ? "border-ardosia-200 text-ardosia-600" : "border-ouro-500"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ardosia-900">{m.assunto}</p>
                <p className="text-xs text-ardosia-500">
                  {m.nome} ·{" "}
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.assunto)}`} className="underline underline-offset-2">
                    {m.email}
                  </a>{" "}
                  · {dataHora(m.criadoEm)}
                </p>
              </div>
              <MarcarLida id={m.id} lida={m.lida} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.mensagem}</p>
          </li>
        ))}
        {mensagens.length === 0 && <li className="text-sm text-ardosia-500">Nenhuma mensagem.</li>}
      </ul>
    </div>
  );
}
