// app/page.tsx

import React from "react";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import PostsListWrapper from "./components/common/PostListWrapper";

export default async function HomePage() {
  const limit = 9;
 

  // Dados iniciais vindos do servidor
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  return (
    <DefaultLayout 
    title="Home - Seu Blog" 
    desc="Bem-vindo ao nosso blog onde compartilhamos as últimas novidades e insights.">
      <PostsListWrapper
        initialPosts={posts}
        initialLastVisibleId={lastVisibleId} 
        hasMore={false}
        showControls={false} // Adicione esta linha para ocultar os botões
        />
    </DefaultLayout>
  );
}
