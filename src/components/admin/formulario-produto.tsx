"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconeFechar, IconeSeta } from "@/components/ui/icones";

type Categoria = { id: string; nome: string };
type Imagem = { url: string; alt: string };
type Variante = { id?: string; tamanho: string; cor: string; corHex: string; estoque: number; ativo: boolean };

export type DadosFormulario = {
  nome: string;
  slug: string;
  resumo: string;
  descricao: string;
  marca: string;
  categoriaId: string;
  precoCentavos: number;
  precoPromocionalCentavos: number | null;
  ativo: boolean;
  destaque: boolean;
  lancamento: boolean;
  imagens: Imagem[];
  variantes: Variante[];
};

function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function reaisParaCentavos(v: string): number {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function centavosParaReais(c: number | null): string {
  return c ? (c / 100).toFixed(2).replace(".", ",") : "";
}

export function FormularioProduto({
  categorias,
  inicial,
  produtoId,
}: {
  categorias: Categoria[];
  inicial: DadosFormulario;
  produtoId?: string;
}) {
  const router = useRouter();
  const [dados, setDados] = useState<DadosFormulario>(inicial);
  const [preco, setPreco] = useState(centavosParaReais(inicial.precoCentavos));
  const [precoPromo, setPrecoPromo] = useState(centavosParaReais(inicial.precoPromocionalCentavos));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const entradaArquivo = useRef<HTMLInputElement>(null);

  function atualizar<K extends keyof DadosFormulario>(chave: K, valor: DadosFormulario[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  async function enviarFotos(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    if (!dados.slug) {
      setErro("Defina o slug antes de enviar fotos");
      return;
    }
    setErro("");
    setEnviandoFotos(true);

    const form = new FormData();
    form.append("slug", dados.slug);
    for (const a of Array.from(arquivos)) form.append("arquivos", a);

    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    setEnviandoFotos(false);

    if (!r.ok) {
      setErro(d.erro ?? "Falha no envio");
      return;
    }
    atualizar("imagens", [...dados.imagens, ...d.urls.map((url: string, i: number) => ({ url, alt: `${dados.nome} — foto ${dados.imagens.length + i + 1}` }))]);
    if (entradaArquivo.current) entradaArquivo.current.value = "";
  }

  function moverImagem(i: number, direcao: -1 | 1) {
    const alvo = i + direcao;
    if (alvo < 0 || alvo >= dados.imagens.length) return;
    const lista = [...dados.imagens];
    [lista[i], lista[alvo]] = [lista[alvo], lista[i]];
    atualizar("imagens", lista);
  }

  function atualizarVariante(i: number, campo: keyof Variante, valor: string | number | boolean) {
    const lista = dados.variantes.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v));
    atualizar("variantes", lista);
  }

  function adicionarVariante() {
    const ultima = dados.variantes[dados.variantes.length - 1];
    atualizar("variantes", [
      ...dados.variantes,
      { tamanho: "", cor: ultima?.cor ?? "Preto", corHex: ultima?.corHex ?? "#141414", estoque: 0, ativo: true },
    ]);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const corpo = {
      ...dados,
      precoCentavos: reaisParaCentavos(preco),
      precoPromocionalCentavos: precoPromo ? reaisParaCentavos(precoPromo) : null,
      variantes: dados.variantes.map((v) => ({ ...v, estoque: Number(v.estoque) })),
    };

    const r = await fetch(produtoId ? `/api/admin/produtos/${produtoId}` : "/api/admin/produtos", {
      method: produtoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const d = await r.json().catch(() => ({}));
    setSalvando(false);

    if (!r.ok) {
      setErro(d.erro ?? "Não foi possível salvar");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!produtoId) router.push(`/admin/produtos/${d.id}`);
    router.refresh();
  }

  async function excluir() {
    if (!produtoId) return;
    if (!window.confirm("Excluir esta peça? Se já foi vendida, ela será apenas desativada.")) return;
    const r = await fetch(`/api/admin/produtos/${produtoId}`, { method: "DELETE" });
    if (r.ok) router.push("/admin/produtos");
  }

  return (
    <form onSubmit={salvar} className="grid gap-8 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        {erro && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{erro}</p>}

        <section className="border border-ardosia-200 bg-white p-5">
          <h2 className="font-display text-lg">Informações</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="rotulo">Nome</label>
              <input
                required
                value={dados.nome}
                onChange={(e) => {
                  atualizar("nome", e.target.value);
                  if (!produtoId) atualizar("slug", gerarSlug(e.target.value));
                }}
                className="campo"
              />
            </div>
            <div>
              <label className="rotulo">Slug (URL)</label>
              <input required value={dados.slug} onChange={(e) => atualizar("slug", gerarSlug(e.target.value))} className="campo font-mono text-sm" />
            </div>
            <div>
              <label className="rotulo">Marca</label>
              <input value={dados.marca} onChange={(e) => atualizar("marca", e.target.value)} className="campo" />
            </div>
            <div>
              <label className="rotulo">Categoria</label>
              <select required value={dados.categoriaId} onChange={(e) => atualizar("categoriaId", e.target.value)} className="campo">
                <option value="">selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo">Resumo (1 linha)</label>
              <input required maxLength={200} value={dados.resumo} onChange={(e) => atualizar("resumo", e.target.value)} className="campo" />
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo">Descrição</label>
              <textarea required rows={7} value={dados.descricao} onChange={(e) => atualizar("descricao", e.target.value)} className="campo" placeholder="Separe parágrafos com uma linha em branco." />
            </div>
          </div>
        </section>

        <section className="border border-ardosia-200 bg-white p-5">
          <h2 className="font-display text-lg">Fotos</h2>
          <p className="mt-1 text-xs text-ardosia-500">JPG, PNG ou WebP até 8 MB. A primeira é a capa. Proporção 3:4.</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input ref={entradaArquivo} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => enviarFotos(e.target.files)} className="text-sm" />
            {enviandoFotos && <span className="text-xs text-ardosia-500">enviando...</span>}
          </div>

          {dados.imagens.length > 0 && (
            <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {dados.imagens.map((img, i) => (
                <li key={img.url} className="group relative">
                  <div className="relative aspect-3/4 overflow-hidden bg-ardosia-100">
                    <Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 bg-ouro-500 px-1.5 text-[0.625rem] font-bold uppercase text-ardosia-900">capa</span>}
                  </div>
                  <div className="mt-1 flex justify-between">
                    <button type="button" onClick={() => moverImagem(i, -1)} disabled={i === 0} className="p-1 text-ardosia-500 disabled:opacity-30" aria-label="Mover para antes">
                      <IconeSeta className="h-3.5 w-3.5" direcao="esquerda" />
                    </button>
                    <button type="button" onClick={() => atualizar("imagens", dados.imagens.filter((_, idx) => idx !== i))} className="p-1 text-ardosia-500 hover:text-red-700" aria-label="Remover foto">
                      <IconeFechar className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moverImagem(i, 1)} disabled={i === dados.imagens.length - 1} className="p-1 text-ardosia-500 disabled:opacity-30" aria-label="Mover para depois">
                      <IconeSeta className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-ardosia-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Variações e estoque</h2>
            <button type="button" onClick={adicionarVariante} className="botao botao-contorno py-1.5 text-xs">
              Adicionar
            </button>
          </div>
          <p className="mt-1 text-xs text-ardosia-500">Variações já vendidas não são apagadas: desmarque "ativa" para tirar do site.</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.08em] text-ardosia-500">
                <tr>
                  <th className="pb-2 pr-3 font-semibold">Cor</th>
                  <th className="pb-2 pr-3 font-semibold">Hex</th>
                  <th className="pb-2 pr-3 font-semibold">Tamanho</th>
                  <th className="pb-2 pr-3 font-semibold">Estoque</th>
                  <th className="pb-2 pr-3 font-semibold">Ativa</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {dados.variantes.map((v, i) => (
                  <tr key={v.id ?? i}>
                    <td className="py-1 pr-3">
                      <input required value={v.cor} onChange={(e) => atualizarVariante(i, "cor", e.target.value)} className="campo py-1.5" />
                    </td>
                    <td className="py-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={v.corHex} onChange={(e) => atualizarVariante(i, "corHex", e.target.value)} className="h-8 w-9 cursor-pointer border border-ardosia-200 bg-white p-0.5" />
                        <input value={v.corHex} onChange={(e) => atualizarVariante(i, "corHex", e.target.value)} className="campo w-24 py-1.5 font-mono text-xs" />
                      </div>
                    </td>
                    <td className="py-1 pr-3">
                      <input required value={v.tamanho} onChange={(e) => atualizarVariante(i, "tamanho", e.target.value.toUpperCase())} className="campo w-20 py-1.5" />
                    </td>
                    <td className="py-1 pr-3">
                      <input type="number" min={0} value={v.estoque} onChange={(e) => atualizarVariante(i, "estoque", Number(e.target.value))} className="campo w-20 py-1.5" />
                    </td>
                    <td className="py-1 pr-3">
                      <input type="checkbox" checked={v.ativo} onChange={(e) => atualizarVariante(i, "ativo", e.target.checked)} className="h-4 w-4 accent-ardosia-900" />
                    </td>
                    <td className="py-1">
                      {!v.id && (
                        <button type="button" onClick={() => atualizar("variantes", dados.variantes.filter((_, idx) => idx !== i))} className="p-1 text-ardosia-400 hover:text-red-700" aria-label="Remover variação">
                          <IconeFechar className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <section className="border border-ardosia-200 bg-white p-5">
          <h2 className="font-display text-lg">Preço</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="rotulo">Preço (R$)</label>
              <input required inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="189,90" className="campo" />
            </div>
            <div>
              <label className="rotulo">Preço promocional (R$)</label>
              <input inputMode="decimal" value={precoPromo} onChange={(e) => setPrecoPromo(e.target.value)} placeholder="vazio = sem promoção" className="campo" />
            </div>
          </div>
        </section>

        <section className="border border-ardosia-200 bg-white p-5">
          <h2 className="font-display text-lg">Exibição</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dados.ativo} onChange={(e) => atualizar("ativo", e.target.checked)} className="h-4 w-4 accent-ardosia-900" />
              Ativa no site
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dados.destaque} onChange={(e) => atualizar("destaque", e.target.checked)} className="h-4 w-4 accent-ardosia-900" />
              Destaque na home
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dados.lancamento} onChange={(e) => atualizar("lancamento", e.target.checked)} className="h-4 w-4 accent-ardosia-900" />
              Marcar como lançamento
            </label>
          </div>
        </section>

        <button type="submit" disabled={salvando} className="botao botao-principal w-full">
          {salvando ? "Salvando..." : produtoId ? "Salvar peça" : "Criar peça"}
        </button>

        {produtoId && (
          <button type="button" onClick={excluir} className="botao w-full border border-red-200 text-red-700 hover:bg-red-50">
            Excluir peça
          </button>
        )}
      </aside>
    </form>
  );
}
