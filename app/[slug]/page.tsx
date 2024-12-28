// app/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import dateFormat from 'dateformat';
import { Metadata } from 'next';
import SafeContent from '../components/common/SafeContent';
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts';
import { PostDetail } from '../utils/types';
import DefaultLayout from '../components/layout/DefaultLayout';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Gera os parâmetros estáticos para rotas dinâmicas.
 */
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

/**
 * Define o intervalo de revalidação para ISR.
 */
export const revalidate = 60; // Revalida a página a cada 60 segundos

/**
 * Gera metadados dinâmicos para cada página.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; // Await params here
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Não Encontrado',
      description: 'O post que você está procurando não foi encontrado.',
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
      card: 'summary_large_image',
      title: post.title,
      description: post.meta,
      images: post.thumbnail ? [post.thumbnail.url] : [],
    },
  };
}

/**
 * Componente da página dinâmica de um post.
 */
const SinglePostPage = async ({ params }: PageProps) => {
  const { slug } = await params; // Await params here
  const post: PostDetail | null = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { title, content, tags, meta, thumbnail, createdAt } = post;

  return (
    <DefaultLayout title={title} desc={meta}>
      <div className="pb-20">
        {thumbnail ? (
          <div className="relative aspect-video rounded overflow-hidden">
            <Image src={thumbnail.url} alt={title} fill className="object-cover" />
          </div>
        ) : null}

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
      </div>
    </DefaultLayout>
  );
};

export default SinglePostPage;
