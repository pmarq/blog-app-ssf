import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import DefaultLayout from "@/app/components/layout/DefaultLayout";
import PostCard from "@/app/components/common/PostCard";
import type { PostDetail } from "@/app/utils/types";
import { firestore } from "@/firebase/server";

export const dynamic = "force-dynamic";

type RouteParams = Promise<{ categorySlug: string }>;

function toIsoSafe(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "number") return new Date(v).toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && v !== null && "toDate" in v) {
    try {
      const d = (v as { toDate: () => Date }).toDate();
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function fetchCategoryTitle(categorySlug: string): Promise<string> {
  const snap = await firestore
    .collection("categories")
    .where("slug", "==", categorySlug)
    .limit(1)
    .get();

  if (snap.empty) return categorySlug;
  const data = snap.docs[0]?.data();
  return String(data?.title || categorySlug);
}

async function fetchPostsByCategory(categorySlug: string): Promise<PostDetail[]> {
  const snap = await firestore
    .collection("posts")
    .where("categorySlug", "==", categorySlug)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const posts: PostDetail[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    posts.push({
      id: doc.id,
      title: String(data.title || ""),
      content: String(data.content || ""),
      slug: String(data.slug || ""),
      meta: String(data.meta || ""),
      tags: Array.isArray(data.tags) ? data.tags : [],
      thumbnail: data.thumbnail || null,
      createdAt: toIsoSafe(data.createdAt),
      updatedAt: data.updatedAt ? toIsoSafe(data.updatedAt) : undefined,
      categorySlug: String(data.categorySlug || ""),
      categoryTitle: String(data.categoryTitle || ""),
      categoryId: String(data.category?.id || ""),
    });
  });

  return posts;
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const title = await fetchCategoryTitle(categorySlug);
  const canonicalPath = `/blog/${categorySlug}`;

  return {
    title: `${title} | Blog`,
    description: `Artigos do tema “${title}”.`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${title} | Blog`,
      description: `Artigos do tema “${title}”.`,
      url: canonicalPath,
      type: "website",
      locale: "pt_BR",
      images: [{ url: "/blog-og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Blog`,
      description: `Artigos do tema “${title}”.`,
      images: ["/blog-og.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: { params: RouteParams }) {
  const { categorySlug } = await params;

  const [categoryTitle, posts] = await Promise.all([
    fetchCategoryTitle(categorySlug),
    fetchPostsByCategory(categorySlug),
  ]);

  // Se não existe categoria nem posts, assume rota inválida
  if (!posts.length && categoryTitle === categorySlug) {
    return notFound();
  }

  return (
    <DefaultLayout title={categoryTitle} desc={`Tema: ${categoryTitle}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-sky-950">
              {categoryTitle}
            </h1>
            <p className="text-slate-600">
              Navegue pelos artigos deste tema.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-sky-700 hover:underline"
          >
            Voltar para o blog
          </Link>
        </div>

        {posts.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={`${post.categorySlug}/${post.slug}`} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-slate-200 bg-white p-6 text-slate-700">
            Nenhum post encontrado nesta categoria.
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

