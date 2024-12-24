// app/(admin)/posts/PostsListWrapper.tsx

"use client";

import React, { useState } from "react";
import PostsList from "./PostList";
import { PostDetail } from "@/app/utils/types";

interface PostsListWrapperProps {
  initialPosts: PostDetail[];
  initialLastVisibleId?: string;
}

// Função para construir URLs absolutas
const buildUrl = (path: string) => {
  // Determina o domínio base (navegador ou servidor)
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin // No navegador
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // No servidor

  try {
    // Cria a URL absoluta combinando o domínio base e o caminho
    return new URL(path, baseUrl).toString();
  } catch (error) {
    console.error("Erro ao construir a URL:", { path, baseUrl, error });
    throw new Error("Failed to build URL");
  }
};

const PostsListWrapper: React.FC<PostsListWrapperProps> = ({
  initialPosts,
  initialLastVisibleId,
}) => {
  // Estado para armazenar os posts
  const [posts, setPosts] = useState<PostDetail[]>(initialPosts);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [lastVisibleId, setLastVisibleId] = useState<string | undefined>(
    initialLastVisibleId
  );

  console.log("Posts iniciais:", initialPosts); // Loga os posts iniciais
  console.log("ID visível inicial:", initialLastVisibleId); // Loga o ID inicial

  // Função para carregar mais posts
  const loadMorePosts = async () => {
    try {
      // Constrói a URL absoluta para buscar mais posts
      const url = buildUrl(`/api/posts?limit=9&lastVisibleId=${lastVisibleId || ""}`);
      console.log("Buscando posts na URL:", url);

      // Faz a requisição para a API
      const response = await fetch(url);
      console.log("Resposta recebida:", response);

      // Verifica se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro ao buscar posts: ${response.statusText}`);
      }

      // Converte a resposta para JSON
      const data = await response.json();
      console.log("Dados recebidos:", data);

      // Atualiza o estado com os novos posts
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMorePosts(data.hasMore);
      setLastVisibleId(data.lastVisibleId);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      setHasMorePosts(false); // Indica que não há mais posts para carregar
    }
  };

  return (
    <PostsList
      posts={posts}
      loadMorePosts={loadMorePosts}
      hasMorePosts={hasMorePosts}
    />
  );
};

export default PostsListWrapper;
