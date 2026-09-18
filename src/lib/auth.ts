import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID, createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const NOME_COOKIE = "sessao";
const DIAS = 7;

function segredo(): Uint8Array {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error("AUTH_SECRET ausente ou com menos de 32 caracteres.");
  }
  return new TextEncoder().encode(valor);
}

export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(usuarioId: string): Promise<void> {
  const jti = randomUUID();
  const expiraEm = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000);

  await prisma.sessao.create({ data: { jti, usuarioId, expiraEm } });

  const token = await new SignJWT({ sub: usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .sign(segredo());

  const jar = await cookies();
  jar.set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(NOME_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, segredo());
      if (payload.jti) await prisma.sessao.deleteMany({ where: { jti: payload.jti } });
    } catch {
      // token inválido: só limpamos o cookie
    }
  }
  jar.delete(NOME_COOKIE);
}

export async function encerrarTodasSessoes(usuarioId: string): Promise<void> {
  await prisma.sessao.deleteMany({ where: { usuarioId } });
}

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  admin: boolean;
};

// Confere a assinatura e, em seguida, a sessão no banco: revogar derruba na hora.
export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const jar = await cookies();
  const token = jar.get(NOME_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo());
    if (!payload.jti || !payload.sub) return null;

    const sessao = await prisma.sessao.findUnique({
      where: { jti: payload.jti },
      include: { usuario: true },
    });
    if (!sessao || sessao.expiraEm < new Date()) return null;

    const u = sessao.usuario;
    return { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone, admin: u.admin };
  } catch {
    return null;
  }
}

export async function exigirUsuario(): Promise<UsuarioSessao> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");
  return usuario;
}

export async function exigirAdmin(): Promise<UsuarioSessao> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar?destino=/admin");
  if (!usuario.admin) redirect("/");
  return usuario;
}

// Versão para rotas de API: devolve null em vez de redirecionar.
export async function adminDaApi(): Promise<UsuarioSessao | null> {
  const usuario = await usuarioAtual();
  return usuario?.admin ? usuario : null;
}

const COOKIE_PEDIDOS = "pedidos";

// Comprador sem conta: guarda os números dos pedidos num cookie assinado,
// para a página do pedido abrir após o checkout sem expor PII a quem adivinhar o número.
export async function lembrarPedido(numero: string): Promise<void> {
  const atuais = await pedidosLembrados();
  const lista = [...new Set([numero, ...atuais])].slice(0, 10);
  const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ pedidos: lista })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .sign(segredo());

  const jar = await cookies();
  jar.set(COOKIE_PEDIDOS, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

export async function pedidosLembrados(): Promise<string[]> {
  const jar = await cookies();
  const token = jar.get(COOKIE_PEDIDOS)?.value;
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, segredo());
    return Array.isArray(payload.pedidos) ? (payload.pedidos as string[]) : [];
  } catch {
    return [];
  }
}

export function gerarTokenRecuperacao(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: createHash("sha256").update(token).digest("hex") };
}

export function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
