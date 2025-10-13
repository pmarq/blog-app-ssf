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

/* --- Rotas estáticas --------------------------------------------------------------- */
export async function generateStaticParams() {
  const snapshot = await getAllPostSlugs();
  return snapshot.map(({ categorySlug, slug }) => ({ categorySlug, slug }));
}

/* --- Metadados dinâmicos (com canônico por post) ---------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: { slug: string; categorySlug: string };
}): Promise<Metadata> {
  const { slug, categorySlug } = params;
  const post = await getPostByCategoryAndSlug(categorySlug, slug);

  if (!post) {
    return {
      title: "Post Não Encontrado",
      description: "O post que você está procurando não foi encontrado.",
      robots: { index: false, follow: false },
    };
  }

  const ogImage = post.thumbnail?.url ?? "/og-default.png"; // coloque esse fallback em /public
  const canonicalPath = `/${categorySlug}/${slug}`;

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
      images: [
        // se tiver width/height, melhor ainda
        { url: ogImage, width: 1200, height: 630, alt: post.title },
      ],
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
  params: { slug: string; categorySlug: string };
}) {
  const { slug, categorySlug } = params;
  const post: PostDetail | null = await getPostByCategoryAndSlug(
    categorySlug,
    slug
  );

  if (!post) return notFound();

  const { title, content, tags, meta, thumbnail, createdAt, updatedAt } = post;
  const publishedISO = new Date(createdAt).toISOString();
  const modifiedISO = new Date(updatedAt ?? createdAt).toISOString();
  const displayDate = dateFormat(new Date(createdAt), "d-mmm-yyyy");
  const ogImage = thumbnail?.url ?? "/og-default.png";

  return (
    <DefaultLayout title={title} desc={meta}>
      {/* JSON-LD Article (ajuda muito no Discover e SEO) */}
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
              "@id": `/${categorySlug}/${slug}`, // relativo ao metadataBase
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

      <section
        className="
          max-w-4xl w-full mx-auto
          px-4 lg:px-0
          space-y-8
          pb-20
        "
      >
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
