"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarrinho } from "@/components/carrinho/contexto";
import { mascaraCep, mascaraCpf, mascaraTelefone, moeda } from "@/lib/formato";
import { UFS } from "@/lib/constantes";
import { IconeEscudo } from "@/components/ui/icones";

type OpcaoFrete = { metodo: string; nome: string; precoCentavos: number; prazoDias: number; descricao: string };

export function FormularioCheckout({
  usuario,
  gatewayLigado,
}: {
  usuario: { nome: string; email: string; telefone: string | null } | null;
  gatewayLigado: boolean;
}) {
  const { itens, pronto, subtotalCentavos, limpar } = useCarrinho();
  const router = useRouter();

  const [dados, setDados] = useState({
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    telefone: usuario?.telefone ? mascaraTelefone(usuario.telefone) : "",
    cpf: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "SP",
  });

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [envioMetodo, setEnvioMetodo] = useState("PAC");
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; descontoCentavos: number } | null>(null);
  const [erroCupom, setErroCupom] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const cepLimpo = dados.cep.replace(/\D/g, "");
  const freteEscolhido = opcoesFrete.find((o) => o.metodo === envioMetodo);
  const freteCentavos = freteEscolhido?.precoCentavos ?? 0;
  const descontoCentavos = cupomAplicado?.descontoCentavos ?? 0;
  const totalCentavos = Math.max(subtotalCentavos - descontoCentavos, 0) + freteCentavos;

  useEffect(() => {
    if (cepLimpo.length !== 8 || itens.length === 0) {
      setOpcoesFrete([]);
      return;
    }

    let cancelado = false;
    (async () => {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: cepLimpo,
          itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade })),
        }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (cancelado || !resposta.ok) return;
      setOpcoesFrete(corpo.opcoes ?? []);
    })();

    return () => {
      cancelado = true;
    };
  }, [cepLimpo, itens]);

  async function buscarCep(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const endereco = await resposta.json();
      if (!endereco.erro) {
        setDados((d) => ({
          ...d,
          logradouro: endereco.logradouro || d.logradouro,
          bairro: endereco.bairro || d.bairro,
          cidade: endereco.localidade || d.cidade,
          uf: endereco.uf || d.uf,
        }));
      }
    } catch {
      // CEP não encontrado: o cliente preenche à mão
    }
    setBuscandoCep(false);
  }

  async function aplicarCupom() {
    setErroCupom("");
    if (!cupom.trim()) return;

    const resposta = await fetch("/api/cupom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: cupom.trim().toUpperCase(),
        itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade })),
      }),
    });

    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      setErroCupom(corpo.erro ?? "Cupom inválido");
      setCupomAplicado(null);
      return;
    }
    setCupomAplicado(corpo.cupom);
  }

  async function finalizar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    const resposta = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cpf: dados.cpf,
        entrega: {
          cep: dados.cep,
          logradouro: dados.logradouro,
          numero: dados.numero,
          complemento: dados.complemento,
          bairro: dados.bairro,
          cidade: dados.cidade,
          uf: dados.uf,
        },
        envioMetodo,
        cupom: cupomAplicado?.codigo ?? "",
        itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade })),
      }),
    });

    const corpo = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setErro(corpo.erro ?? "Não foi possível finalizar o pedido");
      setEnviando(false);
      return;
    }

    limpar();
    if (corpo.urlPagamento) {
      window.location.href = corpo.urlPagamento;
      return;
    }
    router.push(`/pedido/${corpo.numero}`);
  }

  if (!pronto) return <div className="mt-10 h-64 animate-pulse bg-ardosia-100" />;

  if (itens.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-ardosia-300 px-6 py-20 text-center">
        <p className="font-display text-xl">Sua sacola está vazia</p>
        <Link href="/produtos" className="botao botao-principal mt-6">
          Ver o catálogo
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={finalizar} className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-lg">Seus dados</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="rotulo">
                Nome completo
              </label>
              <input
                id="nome"
                required
                value={dados.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                className="campo"
              />
            </div>
            <div>
              <label htmlFor="email" className="rotulo">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={dados.email}
                onChange={(e) => setDados({ ...dados, email: e.target.value })}
                className="campo"
              />
            </div>
            <div>
              <label htmlFor="telefone" className="rotulo">
                Telefone
              </label>
              <input
                id="telefone"
                required
                inputMode="numeric"
                value={dados.telefone}
                onChange={(e) => setDados({ ...dados, telefone: mascaraTelefone(e.target.value) })}
                placeholder="(11) 98888-7777"
                className="campo"
              />
            </div>
            <div>
              <label htmlFor="cpf" className="rotulo">
                CPF
              </label>
              <input
                id="cpf"
                required
                inputMode="numeric"
                value={dados.cpf}
                onChange={(e) => setDados({ ...dados, cpf: mascaraCpf(e.target.value) })}
                placeholder="000.000.000-00"
                className="campo"
              />
              <p className="mt-1 text-xs text-ardosia-400">Exigido pelo gateway para emitir o pagamento.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg">Entrega</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="cep" className="rotulo">
                CEP
              </label>
              <input
                id="cep"
                required
                inputMode="numeric"
                value={dados.cep}
                onChange={(e) => {
                  const valor = mascaraCep(e.target.value);
                  setDados({ ...dados, cep: valor });
                  if (valor.replace(/\D/g, "").length === 8) buscarCep(valor);
                }}
                placeholder="00000-000"
                className="campo"
              />
              {buscandoCep && <p className="mt-1 text-xs text-ardosia-400">buscando endereço...</p>}
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="logradouro" className="rotulo">
                Rua
              </label>
              <input
                id="logradouro"
                required
                value={dados.logradouro}
                onChange={(e) => setDados({ ...dados, logradouro: e.target.value })}
                className="campo"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="numero" className="rotulo">
                Número
              </label>
              <input
                id="numero"
                required
                value={dados.numero}
                onChange={(e) => setDados({ ...dados, numero: e.target.value })}
                className="campo"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="complemento" className="rotulo">
                Complemento
              </label>
              <input
                id="complemento"
                value={dados.complemento}
                onChange={(e) => setDados({ ...dados, complemento: e.target.value })}
                placeholder="apto, bloco, referência"
                className="campo"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="bairro" className="rotulo">
                Bairro
              </label>
              <input
                id="bairro"
                required
                value={dados.bairro}
                onChange={(e) => setDados({ ...dados, bairro: e.target.value })}
                className="campo"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cidade" className="rotulo">
                Cidade
              </label>
              <input
                id="cidade"
                required
                value={dados.cidade}
                onChange={(e) => setDados({ ...dados, cidade: e.target.value })}
                className="campo"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="uf" className="rotulo">
                UF
              </label>
              <select
                id="uf"
                value={dados.uf}
                onChange={(e) => setDados({ ...dados, uf: e.target.value })}
                className="campo"
              >
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg">Forma de envio</h2>
          {opcoesFrete.length === 0 ? (
            <p className="mt-3 text-sm text-ardosia-500">Informe o CEP para ver as opções de entrega.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {opcoesFrete.map((o) => (
                <li key={o.metodo}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors ${
                      envioMetodo === o.metodo ? "border-ardosia-900" : "border-ardosia-200 hover:border-ardosia-400"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="envio"
                        value={o.metodo}
                        checked={envioMetodo === o.metodo}
                        onChange={() => setEnvioMetodo(o.metodo)}
                        className="mt-1 h-4 w-4 accent-ardosia-900"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ardosia-900">{o.nome}</span>
                        <span className="block text-xs text-ardosia-500">
                          {o.descricao} · {o.prazoDias} {o.prazoDias === 1 ? "dia útil" : "dias úteis"}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {o.precoCentavos === 0 ? "grátis" : moeda(o.precoCentavos)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="h-fit border border-ardosia-200 bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg">Seu pedido</h2>

        <ul className="mt-4 space-y-3">
          {itens.map((item) => (
            <li key={item.varianteId} className="flex gap-3">
              <div className="relative aspect-3/4 w-12 shrink-0 bg-ardosia-100">
                {item.imagemUrl && (
                  <Image src={item.imagemUrl} alt="" fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <p className="font-medium text-ardosia-900">{item.produtoNome}</p>
                <p className="text-ardosia-500">
                  {item.cor} · {item.tamanho} · {item.quantidade}un
                </p>
              </div>
              <span className="text-xs font-semibold">{moeda(item.precoCentavos * item.quantidade)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-ardosia-200 pt-5">
          <label htmlFor="cupom" className="rotulo">
            Cupom de desconto
          </label>
          <div className="flex gap-2">
            <input
              id="cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              placeholder="BEMVINDO10"
              className="campo"
            />
            <button type="button" onClick={aplicarCupom} className="botao botao-contorno px-4">
              Aplicar
            </button>
          </div>
          {erroCupom && <p className="mt-2 text-xs text-red-700">{erroCupom}</p>}
          {cupomAplicado && (
            <p className="mt-2 text-xs font-medium text-green-700">
              Cupom {cupomAplicado.codigo} aplicado: −{moeda(cupomAplicado.descontoCentavos)}
            </p>
          )}
        </div>

        <dl className="mt-5 space-y-2 border-t border-ardosia-200 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ardosia-500">Subtotal</dt>
            <dd>{moeda(subtotalCentavos)}</dd>
          </div>
          {descontoCentavos > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>Desconto</dt>
              <dd>−{moeda(descontoCentavos)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ardosia-500">Frete</dt>
            <dd>{freteEscolhido ? (freteCentavos === 0 ? "grátis" : moeda(freteCentavos)) : "—"}</dd>
          </div>
          <div className="flex justify-between border-t border-ardosia-200 pt-3 font-display text-lg">
            <dt>Total</dt>
            <dd>{moeda(totalCentavos)}</dd>
          </div>
        </dl>

        {erro && <p className="mt-4 text-sm font-medium text-red-700">{erro}</p>}

        <button
          type="submit"
          disabled={enviando || opcoesFrete.length === 0}
          className="botao botao-principal mt-5 w-full"
        >
          {enviando ? "Processando..." : gatewayLigado ? "Ir para o pagamento" : "Confirmar pedido"}
        </button>

        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ardosia-500">
          <IconeEscudo className="mt-0.5 h-4 w-4 shrink-0 text-ouro-600" />
          {gatewayLigado
            ? "Você paga no ambiente do Mercado Pago. Nenhum dado de cartão passa por esta loja."
            : "O pedido é registrado como aguardando pagamento e combinamos o Pix pelo WhatsApp."}
        </p>
      </aside>
    </form>
  );
}
