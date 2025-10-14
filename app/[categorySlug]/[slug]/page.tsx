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

  const ogImage = post.thumbnail?.url ?? "/og-default.png"; // coloque o fallback em /public
  // IMPORTANTE: incluir /blog por causa do basePath
  const canonicalPath = `/blog/${categorySlug}/${slug}`;

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
      }
    ).updatedAt ?? createdAt;

  const publishedISO = toDateSafe(createdAt).toISOString();
  const modifiedISO = toDateSafe(maybeUpdated).toISOString();
  const displayDate = dateFormat(toDateSafe(createdAt), "d-mmm-yyyy");
  const ogImage = thumbnail?.url ?? "/og-default.png";

  return (
    <DefaultLayout title={title} desc={meta}>
      {/* JSON-LD Article (ajuda no Discover e SEO) */}
      <Script
        id="ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: meta,
            datePublished: publishedISO,
            dateModified: modifiedISO,
            image: ogImage,
            mainEntityOfPage: {
              "@type": "WebPage",
              // IMPORTANTE: incluir /blog
              "@id": `/blog/${categorySlug}/${slug}`,
            },
            author: {
              "@type": "Organization",
              name: "Inlevor",
            },
            publisher: {
              "@type": "Organization",
              name: "Inlevor",
              logo: {
                "@type": "ImageObject",
                url: "/logo.png",
              },
            },
            keywords: Array.isArray(tags) ? tags.join(", ") : undefined,
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
          <span className="text-sm">{displayDate}</span>
        </div>

        {/* Conteúdo */}
        <SafeContent content={content} />

        {/* Comentários */}
        <Comments belongsTo={`${categorySlug}/${slug}`} />
      </section>
    </DefaultLayout>
  );
}
