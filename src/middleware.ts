import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Primeira barreira: só confere a assinatura do cookie. A sessão no banco é
// conferida nas páginas e rotas (exigirAdmin / adminDaApi).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sessao")?.value;
  const segredo = process.env.AUTH_SECRET;

  let valido = false;
  if (token && segredo && segredo.length >= 32) {
    try {
      await jwtVerify(token, new TextEncoder().encode(segredo));
      valido = true;
    } catch {
      valido = false;
    }
  }

  if (!valido) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    const destino = new URL("/entrar", req.url);
    destino.searchParams.set("destino", pathname);
    return NextResponse.redirect(destino);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*", "/api/admin/:path*", "/api/conta/:path*"],
};
