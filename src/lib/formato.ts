export function moeda(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function data(valor: Date | string): string {
  const d = typeof valor === "string" ? new Date(valor) : valor;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function dataHora(valor: Date | string): string {
  const d = typeof valor === "string" ? new Date(valor) : valor;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function mascaraCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function mascaraCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function cpfValido(valor: string): boolean {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11 % 10;
  if (resto !== Number(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11 % 10;
  return resto === Number(cpf[10]);
}
