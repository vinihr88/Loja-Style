import { z } from "zod";
import { apenasDigitos, cpfValido } from "@/lib/formato";
import { UFS } from "@/lib/constantes";

z.config(z.locales.ptBR());

const texto = (min: number, max: number) => z.string().trim().min(min).max(max);

export const esquemaEmail = z.string().trim().toLowerCase().email("E-mail inválido").max(160);

export const esquemaSenha = z
  .string()
  .min(8, "A senha precisa de ao menos 8 caracteres")
  .max(72, "Senha muito longa");

export const esquemaCadastro = z.object({
  nome: texto(2, 80),
  email: esquemaEmail,
  senha: esquemaSenha,
  telefone: z
    .string()
    .trim()
    .transform(apenasDigitos)
    .refine((v) => v.length === 0 || v.length === 10 || v.length === 11, "Telefone inválido")
    .optional()
    .or(z.literal("")),
});

export const esquemaLogin = z.object({
  email: esquemaEmail,
  senha: z.string().min(1).max(72),
});

export const esquemaRecuperar = z.object({ email: esquemaEmail });

export const esquemaRedefinir = z.object({
  token: z.string().min(20).max(200),
  senha: esquemaSenha,
});

export const esquemaEndereco = z.object({
  apelido: texto(1, 40).default("Principal"),
  destinatario: texto(2, 80),
  cep: z.string().transform(apenasDigitos).refine((v) => v.length === 8, "CEP inválido"),
  logradouro: texto(2, 120),
  numero: texto(1, 12),
  complemento: z.string().trim().max(60).optional().or(z.literal("")),
  bairro: texto(2, 80),
  cidade: texto(2, 80),
  uf: z.string().trim().toUpperCase().refine((v) => UFS.includes(v), "UF inválida"),
});

export const esquemaItemCarrinho = z.object({
  varianteId: z.string().min(1).max(40),
  quantidade: z.number().int().min(1).max(10),
});

export const esquemaFrete = z.object({
  cep: z.string().transform(apenasDigitos).refine((v) => v.length === 8, "CEP inválido"),
  itens: z.array(esquemaItemCarrinho).min(1).max(30),
});

export const esquemaCupom = z.object({
  codigo: z.string().trim().toUpperCase().min(3).max(24),
  itens: z.array(esquemaItemCarrinho).min(1).max(30),
});

// O checkout recebe só varianteId e quantidade: preço e frete são do servidor.
export const esquemaCheckout = z.object({
  nome: texto(2, 80),
  email: esquemaEmail,
  telefone: z
    .string()
    .transform(apenasDigitos)
    .refine((v) => v.length === 10 || v.length === 11, "Telefone inválido"),
  cpf: z
    .string()
    .transform(apenasDigitos)
    .refine(cpfValido, "CPF inválido"),
  entrega: esquemaEndereco.omit({ apelido: true, destinatario: true }),
  envioMetodo: z.enum(["PAC", "SEDEX", "RETIRADA"]),
  cupom: z.string().trim().toUpperCase().max(24).optional().or(z.literal("")),
  itens: z.array(esquemaItemCarrinho).min(1).max(30),
});

export const esquemaContato = z.object({
  nome: texto(2, 80),
  email: esquemaEmail,
  assunto: texto(3, 120),
  mensagem: texto(10, 2000),
});

export const esquemaAvaliacao = z.object({
  produtoId: z.string().min(1).max(40),
  nome: texto(2, 60),
  nota: z.number().int().min(1).max(5),
  comentario: texto(10, 800),
});

export const esquemaVariante = z.object({
  id: z.string().max(40).optional(),
  tamanho: texto(1, 12),
  cor: texto(2, 30),
  corHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida").default("#111111"),
  estoque: z.number().int().min(0).max(9999),
  ativo: z.boolean().default(true),
});

export const esquemaProdutoAdmin = z.object({
  nome: texto(2, 120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug só aceita letras minúsculas, números e hífen")
    .min(3)
    .max(120),
  resumo: texto(5, 200),
  descricao: texto(20, 4000),
  marca: z.string().trim().max(60).optional().or(z.literal("")),
  categoriaId: z.string().min(1).max(40),
  precoCentavos: z.number().int().min(100).max(9_999_999),
  precoPromocionalCentavos: z.number().int().min(0).max(9_999_999).optional().nullable(),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
  lancamento: z.boolean().default(false),
  imagens: z.array(z.object({ url: z.string().min(1).max(300), alt: texto(2, 160) })).max(12),
  variantes: z.array(esquemaVariante).min(1).max(60),
});

export const esquemaCupomAdmin = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]+$/, "Use apenas letras e números")
    .min(3)
    .max(24),
  tipo: z.enum(["PERCENTUAL", "VALOR"]),
  valor: z.number().int().min(1).max(9_999_999),
  minimoCentavos: z.number().int().min(0).max(9_999_999).default(0),
  maxUsos: z.number().int().min(1).max(100_000).optional().nullable(),
  expiraEm: z.string().datetime().optional().nullable(),
  ativo: z.boolean().default(true),
});

export const esquemaStatusPedido = z.object({
  status: z.enum(["AGUARDANDO_PAGAMENTO", "PAGO", "EM_SEPARACAO", "ENVIADO", "ENTREGUE", "CANCELADO"]),
  rastreioCodigo: z.string().trim().max(60).optional().or(z.literal("")),
  observacao: z.string().trim().max(300).optional().or(z.literal("")),
});

export function primeiroErro(erro: z.ZodError): string {
  return erro.issues[0]?.message ?? "Dados inválidos";
}
