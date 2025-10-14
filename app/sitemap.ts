// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchInitialPosts } from "@/lib/fetchPosts";

type PostLite = {
  slug: string;
  categorySlug: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  draft?: boolean;
  indexable?: boolean;
};

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

export const revalidate = 1800; // ✅ literal

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://inlevor.com.br");

  const BASE = `${SITE}/blog`;

  const { posts } = await fetchInitialPosts(200);

  const cleanPosts = (posts ?? [])
    .filter((p: PostLite) => p && p.slug && p.categorySlug)
    .filter(
      (p: PostLite) => p.indexable !== false && p.draft !== true
    ) as PostLite[];

  const categories = Array.from(new Set(cleanPosts.map((p) => p.categorySlug)));

  const postSet = new Set<string>();
  const postItems: MetadataRoute.Sitemap = [];
  for (const p of cleanPosts) {
    const url = `${BASE}/${p.categorySlug}/${p.slug}`;
    if (postSet.has(url)) continue;
    postSet.add(url);

    postItems.push({
      url,
      lastModified: toDateSafe(p.updatedAt ?? p.createdAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const staticItems: MetadataRoute.Sitemap = [
    { url: `${BASE}`, changeFrequency: "daily", priority: 0.8 },
    ...categories.map((c) => ({
      url: `${BASE}/${c}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticItems, ...postItems];
}
