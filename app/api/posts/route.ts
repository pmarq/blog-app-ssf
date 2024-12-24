// app/api/posts/route.ts

import { fetchInitialPosts, fetchMorePosts } from "@/lib/posts";
import { NextRequest, NextResponse } from "next/server";


/**
 * Handler para a rota GET /api/posts
 * Suporta parâmetros de query para paginação:
 * - limit: número de posts a retornar (padrão: 9)
 * - lastVisibleId: ID do último post recebido
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "9", 10);
  const lastVisibleId = searchParams.get("lastVisibleId");

  try {
    let response;
    if (lastVisibleId) {
      // Se houver um cursor, buscar a partir dele
      response = await fetchMorePosts(limit, lastVisibleId);
    } else {
      // Caso contrário, buscar os posts iniciais
      response = await fetchInitialPosts(limit);
    }

    return NextResponse.json({
      posts: response.posts,
      lastVisibleId: response.lastVisibleId,
      hasMore: response.posts.length === limit,
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}