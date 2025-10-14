// app/[categorySlug]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import dateFormat from "dateformat";
import type { Metadata } from "next";
import { getPostByCategoryAndSlug, getAllPostSlugs } from "@/lib/posts";
import type { PostDetail } from "@/app/utils/types";
import SafeContent from "@/app/components/common/SafeContent";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import Comments from "@/app/components/common/comments/Comments";
import Script from "next/script";

// ⏱ ISR: revalida a cada 60 s
export const revalidate = 60;

/* ─────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────*/
function isFirestoreTimestamp(x: unknown): x is { toDate: () => Date } {
  return (
    typeof x === "object" &&
    x !== null &&
    "toDate" in x &&
    typeof (x as any).toDate === "function"
  );
}
function toDateSafe(v: unknown): Date {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  if (isFirestoreTimestamp(v)) {
    try {
      return v.toDate();
    } catch {
      return new Date();
    }
  }
  const d = new Date(v as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Estima wordCount removendo HTML rapidamente */
function estimateWordCount(html: string | undefined): number | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.split(" ").length;
}

/* --- Rotas estáticas --------------------------------------------------------------- */
export async function generateStaticParams() {
  const snapshot = await getAllPostSlugs();
  return snapshot.map(({ categorySlug, slug }) => ({ categorySlug, slug }));
}

/* --- Metadados dinâmicos (com canônico por post) ---------------------------------- */
type RouteParams = Promise<{ slug: string; categorySlug: string }>;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  const post = await getPostByCategoryAndSlug(categorySlug, slug);

  if (!post) {
    return {
      title: "Post Não Encontrado",
      description: "O post que você está procurando não foi encontrado.",
      robots: { index: false, follow: false },
    };
  }

  const ogImage = post.thumbnail?.url ?? "/og-default.png"; // fallback em /public
  // IMPORTANTE: incluir /blog por causa do basePath
  const canonicalPath = `/blog/${categorySlug}/${slug}`;

  // (Opcional) se houver campo de rascunho/não indexável no seu tipo:
  const maybeIndexable =
    (post as unknown as { indexable?: boolean; draft?: boolean }) ?? {};
  const robotsIndex =
    maybeIndexable.indexable === false || maybeIndexable.draft === true
      ? { index: false, follow: false as const }
      : { index: true, follow: true as const };

  return {
    title: post.title,
    description: post.meta,
    alternates: { canonical: canonicalPath }, // relativo ao metadataBase do layout
    openGraph: {
      title: post.title,
      description: post.meta,
      url: canonicalPath,
      type: "article",
      locale: "pt_BR",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta,
      images: [ogImage],
    },
    robots: robotsIndex,
  };
}

/* --- Página do post ---------------------------------------------------------------- */
export default async function SinglePostPage({
  params,
}: {
  params: RouteParams;
}) {
  const { slug, categorySlug } = await params;
  const post: PostDetail | null = await getPostByCategoryAndSlug(
    categorySlug,
    slug
  );

  if (!post) return notFound();

  const { title, content, tags, meta, thumbnail, createdAt } = post;

  // Fallback seguro para updatedAt (sem any)
  const maybeUpdated =
    (
      post as unknown as {
        updatedAt?: string | number | Date | { toDate: () => Date };
        indexable?: boolean;
        draft?: boolean;
      }
    ).updatedAt ?? createdAt;

  const publishedISO = toDateSafe(createdAt).toISOString();
  const modifiedISO = toDateSafe(maybeUpdated).toISOString();
  const displayDate = dateFormat(toDateSafe(createdAt), "d-mmm-yyyy");
  const ogImage = thumbnail?.url ?? "/og-default.png";
  const wordCount = estimateWordCount(content);
  const canonicalPath = `/blog/${categorySlug}/${slug}`;

  return (
    <DefaultLayout title={title} desc={meta}>
      {/* JSON-LD BlogPosting (Discover/SEO) */}
      <Script
        id="ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting", // ← mais específico que Article
            headline: title,
            description: meta,
            image: ogImage,
            datePublished: publishedISO,
            dateModified: modifiedISO,
            inLanguage: "pt-BR",
            articleSection: categorySlug,
            wordCount, // opcional (apenas se definido)
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonicalPath, // relativo; metadataBase deixa absoluto
            },
            author: {
              "@type": "Organization",
              name: "Inlevor",
              url: "/blog",
            },
            publisher: {
              "@type": "Organization",
              name: "Inlevor",
              url: "/blog",
              logo: {
                "@type": "ImageObject",
                url: "/logo.png",
                width: 120, // recomendável informar dimensões do logo
                height: 60,
              },
            },
            keywords: Array.isArray(tags) ? tags.join(", ") : undefined,
          }),
        }}
      />

      {/* JSON-LD Breadcrumbs */}
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Blog", item: "/blog" },
              {
                "@type": "ListItem",
                position: 2,
                name: categorySlug,
                item: `/blog/${categorySlug}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: canonicalPath,
              },
            ],
          }),
        }}
      />

      <section className="max-w-4xl w-full mx-auto px-4 lg:px-0 space-y-8 pb-20">
        {/* Capa */}
        {thumbnail && (
          <div className="relative w-full aspect-video overflow-hidden rounded-lg">
            <Image
              src={thumbnail.url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        )}

        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-semibold text-primary-dark dark:text-primary">
          {title}
        </h1>

        {/* Tags + data */}
        <div className="flex items-center justify-between text-secondary-dark dark:text-secondary-light">
          <div className="flex flex-wrap items-center gap-x-1">
            {tags?.map((t, i) => (
              <span key={`${t}-${i}`} className="text-sm">
                #{t}
              </span>
            ))}
          </div>
          {/* use <time> semântica */}
          <time className="text-sm" dateTime={publishedISO}>
            {displayDate}
          </time>
        </div>

        {/* Conteúdo */}
        <SafeContent content={content} />

        {/* Comentários */}
        <Comments belongsTo={`${categorySlug}/${slug}`} />
      </section>
    </DefaultLayout>
  );
}
