// app/[categorySlug]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import dateFormat from "dateformat";
import { Metadata } from "next";
import { getPostByCategoryAndSlug, getAllPostSlugs } from "@/lib/posts";
import { PostDetail } from "@/app/utils/types";
import SafeContent from "@/app/components/common/SafeContent";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import Comments from "@/app/components/common/comments/Comments";

interface PageProps {
  params: {
    slug: string;
    categorySlug: string;
  };
}

// ⏱ ISR: revalida a cada 60 segundos
export const revalidate = 60;

/**
 * Gera os caminhos estáticos: [categorySlug]/[slug]
 */
export async function generateStaticParams() {
  const snapshot = await getAllPostSlugs();

  return snapshot.map(({ categorySlug, slug }) => ({
    categorySlug,
    slug,
  }));
}

/**
 * Gera metadados dinâmicos com base no slug + categoria.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  const post = await getPostByCategoryAndSlug(categorySlug, slug);

  if (!post) {
    return {
      title: "Post Não Encontrado",
      description: "O post que você está procurando não foi encontrado.",
    };
  }

  return {
    title: post.title,
    description: post.meta,
    openGraph: {
      title: post.title,
      description: post.meta,
      images: post.thumbnail ? [post.thumbnail.url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta,
      images: post.thumbnail ? [post.thumbnail.url] : [],
    },
  };
}

/**
 * Página individual do post por categoria + slug
 */
export default async function SinglePostPage({ params }: PageProps) {
  const { slug, categorySlug } = await params;
  const post: PostDetail | null = await getPostByCategoryAndSlug(
    categorySlug,
    slug
  );

  if (!post) notFound();

  const { title, content, tags, meta, thumbnail, createdAt } = post;

  return (
    <DefaultLayout title={title} desc={meta}>
      <div className="pb-20">
        {thumbnail && (
          <div className="relative aspect-video rounded overflow-hidden">
            <Image
              src={thumbnail.url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-6xl font-semibold text-primary-dark dark:text-primary py-2">
          {title}
        </h1>

        <div className="flex items-center justify-between py-2 text-secondary-dark dark:text-secondary-light">
          <div className="flex flex-wrap items-center space-x-1">
            {tags.map((t, index) => (
              <span key={`${t}-${index}`} className="text-sm">
                #{t}
              </span>
            ))}
          </div>
          <span className="text-sm">
            {dateFormat(new Date(createdAt), "d-mmm-yyyy")}
          </span>
        </div>

        <SafeContent content={content} />

        <div className="mt-10">
          <Comments belongsTo={slug} />
        </div>
      </div>
    </DefaultLayout>
  );
}
