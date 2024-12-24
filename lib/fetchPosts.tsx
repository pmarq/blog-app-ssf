// app/lib/fetchPosts.ts

import { PostDetail } from "@/app/utils/types";

export default async function fetchInitialPosts(limit: number) {
  try {
    // Verifica o ambiente (servidor ou cliente)
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000" // URL base no servidor
        : ""; // URL relativa no cliente

    const response = await fetch(`${baseUrl}/api/posts?limit=${limit}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar posts.");
    }

    const {
      posts,
      lastVisibleId,
    }: { posts: PostDetail[]; lastVisibleId: string | undefined } =
      await response.json();

    return { posts, lastVisibleId };
  } catch (error) {
    console.error("Erro ao buscar posts iniciais:", error);
    return { posts: [], lastVisibleId: undefined };
  }
}
