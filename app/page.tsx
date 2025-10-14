// app/page.tsx

// app/blog/page.tsx
/* Página inicial do Blog Inlevor
   ──> Usa variável de ambiente para baseURL
   ──> Metadata API + ISR + JSON‑LD
*/
import { Metadata } from "next";
import Script from "next/script";

import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import HighlightedPost from "./components/common/HighlightedPost";
import FeaturedProductsSlider from "./components/common/featured-banner/FeaturedBannerSlider";
import PostsListWrapper from "./components/common/PostListWrapper";

/* ─────────────────────────────────────────────
 * 1. Resolver BASE_URL de forma segura
 *    • NEXT_PUBLIC_BASE_URL (ex.: https://inlevor.com.br)
 *    • VERCEL_URL (pré‑visualizações)
 *    • Fallback → localhost
 * ────────────────────────────────────────────*/
function getBaseURL(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
const BASE_URL = getBaseURL();
const OG_IMAGE = "/blog-og.png"; // 1200 × 630

/* ─────────────────────────────────────────────
 * 2. Metadata estática (Next Metadata API)
 * ────────────────────────────────────────────*/
export const metadata: Metadata = {
  title: "Blog Inlevor | Mercado Imobiliário de Alto Padrão",
  description:
    "Artigos, análises e tendências sobre o mercado imobiliário de alto padrão. Acompanhe e encontre oportunidades exclusivas.",
  alternates: { canonical: `${BASE_URL}` },
  openGraph: {
    title: "Blog Inlevor | Mercado de Alto Padrão",
    description:
      "Insights sobre lançamentos, novidades e tendências sobre o mercado imobiliário de alto padrão.",
    url: `${BASE_URL}`,
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
 * 3. ISR – revalida a cada 60 s
 * ────────────────────────────────────────────*/
export const revalidate = 60;

/* ─────────────────────────────────────────────
 * 4. Página
 * ────────────────────────────────────────────*/
export default async function BlogHomePage() {
  /* Busca posts */
  const limit = 17;
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  if (!posts?.length) {
    return (
      <DefaultLayout>
        <p>Nenhum post encontrado.</p>
      </DefaultLayout>
    );
  }

  const [latestPost, ...otherPosts] = posts;

  /* Busca banners via API interna */
  const banners = await fetch(`${BASE_URL}/api/featured-banners`, {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <DefaultLayout>
      {/* Dados estruturados JSON‑LD */}
      <Script
        id="ld-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog Inlevor",
            url: `${BASE_URL}`,
            description:
              "Artigos e tendências sobre o mercado imobiliário de alto padrão.",
            publisher: {
              "@type": "Organization",
              name: "Inlevor",
              logo: {
                "@type": "ImageObject",
                url: `${BASE_URL}/logo.png`,
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
          hasMore={false} /* ajustar se implementar paginação */
          showControls={false}
        />
      </div>
    </DefaultLayout>
  );
}
