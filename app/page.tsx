// app/page.tsx

import React from "react";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import HighlightedPost from "./components/common/HighlightedPost"; // Novo componente
import FeaturedProductsSlider from "./components/common/featured-banner/FeaturedBannerSlider";
import PostsListWrapper from "./components/common/PostListWrapper";

// Função auxiliar para buscar banners via API interna
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function fetchFeaturedBanners() {
  const res = await fetch(`${baseUrl}/api/featured-banners`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar banners");
  }

  return res.json();
}
export default async function HomePage() {
  const limit = 17; // 1 para HighlightedPost + 16 para PostsListWrapper

  // Busca os posts
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  if (!posts || posts.length === 0) {
    return (
      <DefaultLayout
        title="Home - Seu Blog"
        desc="Bem-vindo ao nosso blog onde compartilhamos as últimas novidades e insights."
      >
        <p>Nenhum post encontrado.</p>
      </DefaultLayout>
    );
  }

  // Separa o primeiro post como o último post destacado
  const [latestPost, ...otherPosts] = posts;

  // Busca os banners
  const banners = await fetchFeaturedBanners();
  console.log("BANNERS====>", banners);

  return (
    <DefaultLayout
      title="Home - Seu Blog"
      desc="Bem-vindo ao nosso blog onde compartilhamos as últimas novidades e insights."
    >
      {/* Banner */}
      <div className="mb-14">
        <FeaturedProductsSlider banners={banners} />
      </div>
      {/* Último Post Destacado */}
      <div className="mb-8">
        <HighlightedPost post={latestPost} />
      </div>
      {/* Outros Posts */}
      <h2 className="text-xl bold">Confira também...</h2>
      <PostsListWrapper
        initialPosts={otherPosts}
        initialLastVisibleId={lastVisibleId}
        hasMore={false} // Ajuste conforme a lógica de paginação
        showControls={false}
      />
    </DefaultLayout>
  );
}
