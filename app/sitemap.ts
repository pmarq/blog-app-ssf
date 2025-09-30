// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchInitialPosts } from "@/lib/fetchPosts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://inlevor.com.br");

  const { posts } = await fetchInitialPosts(100); // ajuste
  const postItems = (posts || []).map((p: any) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8 },
    ...postItems,
  ];
}
