// middleware.ts (BLOG) - controla hosts e acesso ao dashboard

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Hosts permitidos (inclui variação com www)
const ALLOWED_HOSTS = [
  "inlevor.com.br",
  "www.inlevor.com.br",
  "blog-app-cloudinary-v3.vercel.app",
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

  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ["/login", "/register", "/post-search", "/forgot-password"];

  if (!token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redireciona usuários autenticados para a home ao acessar rotas públicas
  if (token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Bloqueia acesso a outras rotas sem token
  if (!token) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
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
        `/api/refresh-token?redirect=${encodeURIComponent(pathname)}`,
        request.nextUrl.origin
      )
    );
  }

  // Bloqueia acesso ao dashboard para não administradores
  if (!decodedToken.admin && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Redireciona administradores acessando favoritos
  if (decodedToken.admin && pathname.startsWith("/account/my-favourites")) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
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
  ],
};
