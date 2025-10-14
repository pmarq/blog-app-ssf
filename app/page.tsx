// app/page.tsx

// app/page.tsx  ⬅️ (HOME do BLOG quando basePath="/blog")

import type { Metadata } from "next";
import Script from "next/script";

import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import HighlightedPost from "./components/common/HighlightedPost";
import FeaturedProductsSlider from "./components/common/featured-banner/FeaturedBannerSlider";
import PostsListWrapper from "./components/common/PostListWrapper";

/* ─────────────────────────────────────────────
 * 1) Constantes locais
 * ────────────────────────────────────────────*/
const BLOG_PATH = "/blog"; // público (coerente com basePath)
const OG_IMAGE = "/blog-og.png"; // arquivo em /public/blog-og.png

/* ─────────────────────────────────────────────
 * 2) Metadata (use caminhos relativos!)
 * ────────────────────────────────────────────*/
export const metadata: Metadata = {
  title: "Blog Inlevor | Mercado Imobiliário de Alto Padrão",
  description:
    "Artigos, análises e tendências sobre o mercado imobiliário de alto padrão. Acompanhe e encontre oportunidades exclusivas.",
  // Como o layout já tem metadataBase, use caminhos relativos:
  alternates: { canonical: BLOG_PATH },
  openGraph: {
    title: "Blog Inlevor | Mercado de Alto Padrão",
    description:
      "Insights sobre lançamentos, novidades e tendências do mercado imobiliário de alto padrão.",
    url: BLOG_PATH,
    siteName: "Inlevor",
    type: "website",
    locale: "pt_BR",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Blog Inlevor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Inlevor | Mercado de Alto Padrão",
    description:
      "Dados, tendências e oportunidades no mercado imobiliário de alto padrão – atualizado pela Inlevor.",
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

/* ─────────────────────────────────────────────
 * 3) ISR – revalida a cada 60 s
 * ────────────────────────────────────────────*/
export const revalidate = 60;

/* ─────────────────────────────────────────────
 * 4) Página
 * ────────────────────────────────────────────*/
export default async function BlogHomePage() {
  // Busca posts
  const limit = 17;
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  // Busca banners via API interna (URL relativa!)
  const banners = await fetch(`/api/featured-banners`, {
    cache: "no-store",
    // next: { revalidate: 0 } // alternativa
  }).then((r) => r.json());

  if (!posts?.length) {
    return (
      <DefaultLayout>
        <div className="max-w-4xl w-full mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold mb-2">Blog Inlevor</h1>
          <p className="text-slate-600">Nenhum post encontrado.</p>
        </div>
      </DefaultLayout>
    );
  }

  const [latestPost, ...otherPosts] = posts;

  return (
    <DefaultLayout>
      {/* JSON-LD (use caminhos absolutos). Como o layout define metadataBase,
          você pode montar a URL absoluta no cliente, mas é melhor resolvê-la
          aqui usando location só no client. Para manter absoluto no server,
          você pode usar uma ENV pública com o domínio, mas se não tiver,
          mantenha relativo sem prejuízo. */}
      <Script
        id="ld-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog Inlevor",
            url: BLOG_PATH, // relativo (metadataBase torna absoluto)
            description:
              "Artigos e tendências sobre o mercado imobiliário de alto padrão.",
            publisher: {
              "@type": "Organization",
              name: "Inlevor",
              logo: {
                "@type": "ImageObject",
                url: "/logo.png", // relativo; vira absoluto via metadataBase
              },
            },
          }),
        }}
      />

      {/* Banner de destaque */}
      <div className="mb-14">
        <FeaturedProductsSlider banners={banners} />
      </div>

      <div className="mb-8 md:mb-14 text-2xl font-semibold text-sky-950 text-center">
        Acompanhe o Mercado Imobiliário de Alto Padrão
      </div>

      {/* Post em destaque */}
      <HighlightedPost post={latestPost} />

      {/* Lista de artigos */}
      <div className="p-0 md:p-10">
        <h2 className="text-xl text-sky-950 font-semibold mb-4">
          Confira também...
        </h2>
        <PostsListWrapper
          initialPosts={otherPosts}
          initialLastVisibleId={lastVisibleId}
          hasMore={false} // ajustar se implementar paginação
          showControls={false}
        />
      </div>
    </DefaultLayout>
  );
}
