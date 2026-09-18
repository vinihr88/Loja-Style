// Limite de tentativas em memória. Suficiente para um processo só (VPS/Railway).
// Em várias instâncias, trocar por Redis mantendo esta assinatura.
type Registro = { contador: number; reiniciaEm: number };

const baldes = new Map<string, Registro>();

export function limitar(chave: string, maximo: number, janelaMs: number): boolean {
  const agora = Date.now();
  const atual = baldes.get(chave);

  if (!atual || atual.reiniciaEm <= agora) {
    baldes.set(chave, { contador: 1, reiniciaEm: agora + janelaMs });
    return true;
  }

  if (atual.contador >= maximo) return false;

  atual.contador += 1;
  return true;
}

export function ipDaRequisicao(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

// Limpa baldes vencidos de vez em quando para a memória não crescer sem limite.
if (typeof setInterval === "function") {
  const timer = setInterval(() => {
    const agora = Date.now();
    for (const [chave, registro] of baldes) {
      if (registro.reiniciaEm <= agora) baldes.delete(chave);
    }
  }, 10 * 60 * 1000);
  timer.unref?.();
}
