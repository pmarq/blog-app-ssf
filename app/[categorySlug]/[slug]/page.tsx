// app/[categorySlug]/[slug]/page.tsx

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

// ⏱ ISR: revalida a cada 60 s
export const revalidate = 60;

/* --- Rotas estáticas ---------------------------------------------------------------- */
export async function generateStaticParams() {
  const snapshot = await getAllPostSlugs();
  return snapshot.map(({ categorySlug, slug }) => ({
    categorySlug,
    slug,
  }));
}

/* --- Metadados dinâmicos ------------------------------------------------------------- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}): Promise<Metadata> {
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

/* --- Página do post ----------------------------------------------------------------- */
export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const post: PostDetail | null = await getPostByCategoryAndSlug(
    categorySlug,
    slug
  );

  if (!post) return notFound();

  const { title, content, tags, meta, thumbnail, createdAt } = post;

  return (
    <DefaultLayout title={title} desc={meta}>
      <section
        className="
          max-w-4xl w-full mx-auto     /* Coluna ~720 px, centralizada             */
          px-4 lg:px-0                 /* Padding lateral em telas pequenas        */
          space-y-8                    /* Respiro uniforme entre blocos            */
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
            />
          </div>
        )}

        {/* Título */}
        <h1 className="text-3xl font-semibold text-primary-dark dark:text-primary">
          {title}
        </h1>

        {/* Tags + data */}
        <div className="flex items-center justify-between text-secondary-dark dark:text-secondary-light">
          <div className="flex flex-wrap items-center gap-x-1">
            {tags.map((t, i) => (
              <span key={`${t}-${i}`} className="text-sm">
                #{t}
              </span>
            ))}
          </div>
          <span className="text-sm">
            {dateFormat(new Date(createdAt), "d-mmm-yyyy")}
          </span>
        </div>

        {/* Conteúdo */}
        <SafeContent content={content} />

        {/* Comentários */}
        <Comments belongsTo={slug} />
      </section>
    </DefaultLayout>
  );
}
