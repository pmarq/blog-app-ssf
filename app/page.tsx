// app/page.tsx
/* Página inicial do Blog Inlevor
   ──> Usa variáveis de ambiente com /blog sem duplicar
   ──> Metadata API + ISR + JSON-LD
*/
import type { Metadata } from "next";
import Script from "next/script";

import DefaultLayout from "@/app/components/layout/DefaultLayout";
import { fetchInitialPosts } from "@/lib/fetchPosts";
import HighlightedPost from "./components/common/HighlightedPost";
import FeaturedProductsSlider from "./components/common/featured-banner/FeaturedBannerSlider";
import PostsListWrapper from "./components/common/PostListWrapper";

/* ─────────────────────────────────────────────
 * Helpers para normalizar BASE_URL com path
 * ────────────────────────────────────────────*/
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function getOriginAndBasePath() {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://inlevor.com.br");

  let origin = "https://inlevor.com.br";
  let baseFromUrl = "";

  try {
    const u = new URL(raw);
    origin = `${u.protocol}//${u.host}`;
    const p = stripTrailingSlash(u.pathname || "");
    baseFromUrl = p && p !== "/" ? p : "";
  } catch {
    // se vier algo como "https://inlevor.com.br/blog", tenta separar
    const noSlashEnd = stripTrailingSlash(raw);
    if (noSlashEnd.includes("://")) {
      const [, hostAndPath] = noSlashEnd.split("://");
      const firstSlash = hostAndPath.indexOf("/");
      if (firstSlash > -1) {
        origin = noSlashEnd.slice(0, noSlashEnd.indexOf("/", 8)); // até antes do path
        baseFromUrl = noSlashEnd.slice(noSlashEnd.indexOf("/", 8));
      } else {
        origin = noSlashEnd;
      }
    } else {
      origin = noSlashEnd;
    }
  }

  const envBase = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const basePath = baseFromUrl || envBase;

  return {
    origin,
    basePath: basePath ? ensureLeadingSlash(basePath) : "",
  };
}

const { origin: ORIGIN, basePath: BASE_PATH } = getOriginAndBasePath(); // ex.: https://inlevor.com.br + /blog
const ABS_BLOG = `${ORIGIN}${BASE_PATH}`; // ex.: https://inlevor.com.br/blog
const OG_IMAGE = "/blog-og.png"; // deve existir em /public/blog-og.png

/* ─────────────────────────────────────────────
 * Metadata (canônico/OG ABSOLUTOS p/ evitar /blog/blog)
 * ────────────────────────────────────────────*/
export const metadata: Metadata = {
  title: "Blog Inlevor | Mercado Imobiliário de Alto Padrão",
  description:
    "Artigos, análises e tendências sobre o mercado imobiliário de alto padrão. Acompanhe e encontre oportunidades exclusivas.",
  alternates: { canonical: ABS_BLOG },
  openGraph: {
    title: "Blog Inlevor | Mercado de Alto Padrão",
    description:
      "Insights sobre lançamentos, novidades e tendências sobre o mercado imobiliário de alto padrão.",
    url: ABS_BLOG,
    siteName: "Inlevor",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: `${ORIGIN}${OG_IMAGE}`,
        width: 1200,
        height: 630,
        alt: "Blog Inlevor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Inlevor | Mercado de Alto Padrão",
    description:
      "Dados, tendências e oportunidades no mercado imobiliário de alto padrão – atualizado pela Inlevor.",
    images: [`${ORIGIN}${OG_IMAGE}`],
  },
  robots: { index: true, follow: true },
};

/* ─────────────────────────────────────────────
 * ISR – revalida a cada 60 s
 * ────────────────────────────────────────────*/
export const revalidate = 60;

/* ─────────────────────────────────────────────
 * Página
 * ────────────────────────────────────────────*/
export default async function BlogHomePage() {
  // Posts
  const limit = 17;
  const { posts, lastVisibleId } = await fetchInitialPosts(limit);

  // Banners via API absoluta correta (respeitando /blog)
  let banners: any[] = [];
  try {
    const r = await fetch(`${ABS_BLOG}/api/featured-banners`, {
      cache: "no-store",
    });
    const raw = await r.json();
    // “plain-ificar” (evita classes tipo Firestore Timestamp em Client Components)
    banners = JSON.parse(JSON.stringify(raw ?? []));
  } catch {
    banners = [];
  }

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
      {/* JSON-LD (absoluto pra evitar ambiguidades de basePath) */}
      <Script
        id="ld-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog Inlevor",
            url: ABS_BLOG,
            description:
              "Artigos e tendências sobre o mercado imobiliário de alto padrão.",
            publisher: {
              "@type": "Organization",
              name: "Inlevor",
              logo: {
                "@type": "ImageObject",
                url: `${ORIGIN}/logo.png`,
                width: 120,
                height: 60,
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
