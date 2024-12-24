/* import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE: ", request.url);
  if (request.method === "POST") {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;

  const { pathname } = request.nextUrl;

  if (
    !token &&
    (pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/property-search") ||
      pathname.startsWith("/forgot-password"))
  ) {
    return NextResponse.next();
  }

  if (
    token &&
    (pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const decodedToken = decodeJwt(token);

  if (decodedToken.exp && (decodedToken.exp - 300) * 1000 < Date.now()) {
    return NextResponse.redirect(
      new URL(
        `/api/refresh-token?redirect=${encodeURIComponent(pathname)}`,
        request.url
      )
    );
  }

  if (!decodedToken.admin && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (decodedToken.admin && pathname.startsWith("/account/my-favourites")) {
    return NextResponse.redirect(new URL("/", request.url));
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
    "/property-search",
  ],
};
 */

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE: URL:", request.url);

  const cookieStore = await cookies(); // Acessa os cookies
  const token = cookieStore.get("firebaseAuthToken")?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas que não exigem autenticação
  const publicRoutes = ["/login", "/register", "/property-search", "/forgot-password"];

  // Permite acesso às rotas públicas sem autenticação
  if (!token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redireciona usuários autenticados para a página inicial ao acessar rotas públicas
  if (
    token &&
    ["/login", "/register", "/forgot-password"].some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Bloqueia acesso a outras rotas sem token
  if (!token) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  let decodedToken;
  try {
    // Decodifica o token JWT
    decodedToken = decodeJwt(token);
  } catch (error) {
    console.error("Token inválido:", error);
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Verifica se o token expirou (com margem de 5 minutos)
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

  // Bloqueia acesso ao dashboard para usuários não administradores
  if (!decodedToken.admin && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Redireciona administradores acessando a página de favoritos
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
    "/property-search",
  ],
};
