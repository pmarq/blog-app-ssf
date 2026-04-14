// middleware.ts (BLOG) - controla hosts e acesso ao dashboard

import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";

// Hosts permitidos (inclui variação com www)
const ALLOWED_HOSTS = [
  "saboressemfronteiras.com.br",
  "www.saboressemfronteiras.com.br",
  process.env.VERCEL_URL,
];

export async function middleware(request: NextRequest) {
  // Valida host
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";

  // permite localhost durante `next dev`
  if (
    !host.startsWith("localhost") &&
    !ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  console.log("MIDDLEWARE: URL:", request.url);

  const token = request.cookies.get("firebaseAuthToken")?.value;
  const { pathname } = request.nextUrl;
  const basePath = request.nextUrl.basePath || "";
  const normalizedPath =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const basePrefix = basePath || "";
  const homePath = basePath || "/";

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ["/login", "/register", "/post-search", "/forgot-password"];

  if (!token && publicRoutes.some((route) => normalizedPath.startsWith(route))) {
    return NextResponse.next();
  }

  // Redireciona usuários autenticados para a home ao acessar rotas públicas
  if (token && publicRoutes.some((route) => normalizedPath.startsWith(route))) {
    return NextResponse.redirect(new URL(homePath, request.nextUrl.origin));
  }

  // Bloqueia acesso a outras rotas sem token
  if (!token) {
    return NextResponse.redirect(new URL(homePath, request.nextUrl.origin));
  }

  let decodedToken;
  try {
    decodedToken = decodeJwt(token);
  } catch (error) {
    console.error("Token inválido:", error);
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Verifica expiração (margem 5 min)
  const tokenExpiration = decodedToken.exp ? decodedToken.exp * 1000 : 0;
  const isTokenExpired = tokenExpiration - 300 * 1000 < Date.now();

  if (isTokenExpired) {
    return NextResponse.redirect(
      new URL(
        `${basePrefix}/api/refresh-token?redirect=${encodeURIComponent(
          normalizedPath
        )}`,
        request.nextUrl.origin
      )
    );
  }

  // Bloqueia acesso ao dashboard para não administradores
  if (!decodedToken.admin && normalizedPath.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(homePath, request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/account",
    "/account/:path*",
    "/post-search",
    // Segurança extra para quando o app roda com basePath "/blog"
    "/blog/dashboard",
    "/blog/dashboard/:path*",
    "/blog/login",
    "/blog/register",
    "/blog/forgot-password",
    "/blog/account",
    "/blog/account/:path*",
    "/blog/post-search",
  ],
};
