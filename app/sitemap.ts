// app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchInitialPosts } from "@/lib/fetchPosts";

/* ── helpers pra normalizar URL ───────────────────────── */
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

/* Firestore Timestamp -> Date */
function isTs(x: unknown): x is { toDate: () => Date } {
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
  if (isTs(v)) {
    try {
      return v.toDate();
    } catch {
      return new Date();
    }
  }
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? new Date() : d;
}

/* ── TIPAGEM enxuta ───────────────────────────────────── */
type PostLite = {
  slug: string;
  categorySlug: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  draft?: boolean;
  indexable?: boolean;
};

export const revalidate = 1800; // literal (Next 15 exige número direto)

/* ── SITEMAP ───────────────────────────────────────────── */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1) ORIGIN sem path e sem barra final
  const ORIGIN = stripTrailingSlash(
    process.env.NEXT_PUBLIC_BASE_URL
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://inlevor.com.br"
  );

  // 2) basePath do app (em prod é /blog). Aceita vir com/sem barra
  const BASE_PATH = ensureLeadingSlash(
    stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_PATH ?? "/blog")
  );

  // 3) BASE final do blog (sem duplicar /blog)
  const BASE = `${ORIGIN}${BASE_PATH}`;

  const { posts } = await fetchInitialPosts(200);

  const clean = (posts ?? [])
    .filter((p: PostLite) => p && p.slug && p.categorySlug)
    .filter(
      (p: PostLite) => p.indexable !== false && p.draft !== true
    ) as PostLite[];

  const categories = Array.from(new Set(clean.map((p) => p.categorySlug)));

  const items: MetadataRoute.Sitemap = [
    // home do blog
    { url: `${BASE}`, changeFrequency: "daily", priority: 0.8 },
    // categorias
    ...categories.map((c) => ({
      url: `${BASE}/${c}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // posts
    ...clean.map((p) => ({
      url: `${BASE}/${p.categorySlug}/${p.slug}`,
      lastModified: toDateSafe(p.updatedAt ?? p.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return items;
}
