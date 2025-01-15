// app/page.tsx

import React from "react";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import PostsListWrapper from "./components/common/PostListWrapper";
import FeaturedProductsSlider from "./components/common/featured-banner/FeaturedBannerSlider";

// Função auxiliar para buscar banners via API interna
async function fetchFeaturedBanners() {
  // Em produção, ajuste a URL (ex.: process.env.NEXT_PUBLIC_APP_URL, etc.)
  const res = await fetch("http://localhost:3000/api/featured-banners", {
    cache: "no-store", // ou 'force-cache' / revalidate / etc., conforme sua estratégia
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar banners");
  }

  // Retorna um array de banners
  return res.json();
}

export default async function HomePage() {
  const limit = 16;

  // Busca os posts
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  // Busca os banners
  const banners = await fetchFeaturedBanners();
  console.log("BANNERS====>", banners);

  return (
    <DefaultLayout
      title="Home - Seu Blog"
      desc="Bem-vindo ao nosso blog onde compartilhamos as últimas novidades e insights."
    >
      {/* Se você tiver um NavBar dentro de DefaultLayout, ele já aparece automaticamente */}

      {/* 1) Renderiza o slider de Banners, passando a prop 'banners' */}
      <FeaturedProductsSlider banners={banners} />

      {/* 2) Renderiza a lista de posts */}
      <PostsListWrapper
        initialPosts={posts}
        initialLastVisibleId={lastVisibleId}
        hasMore={false}
        showControls={false}
      />
    </DefaultLayout>
  );
}
