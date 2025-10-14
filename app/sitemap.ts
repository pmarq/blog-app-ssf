// app/sitemap.ts

import type { MetadataRoute } from "next";
import { fetchInitialPosts } from "@/lib/fetchPosts";

/* ── helpers ─────────────────────────────── */
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function getOriginAndBasePath() {
  // 1) Parte “origin” (protocolo + host), SEM path
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://inlevor.com.br");

  let origin = "https://inlevor.com.br";
  let baseFromUrl = "";

  try {
    const u = new URL(raw);
    origin = `${u.protocol}//${u.host}`;
    const p = stripTrailingSlash(u.pathname || "");
    baseFromUrl = p && p !== "/" ? p : "";
  } catch {
    origin = stripTrailingSlash(raw);
  }

  // 2) Base path também pode vir por env separada
  const envBase = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_PATH ?? "");

  // 3) Se a URL já tem path (ex.: /blog), usa esse; senão, usa o da env
  const basePath = baseFromUrl || envBase;

  return {
    origin,
    basePath: basePath ? ensureLeadingSlash(basePath) : "",
  };
}

/* ── datas “seguras” ─────────────────────── */
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

type PostLite = {
  slug: string;
  categorySlug: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  draft?: boolean;
  indexable?: boolean;
};

export const revalidate = 1800; // literal

/* ── sitemap ─────────────────────────────── */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { origin, basePath } = getOriginAndBasePath();
  const BASE = `${origin}${basePath}`; // ← nunca duplica /blog

  const { posts } = await fetchInitialPosts(200);

  const clean = (posts ?? [])
    .filter((p: PostLite) => p?.slug && p?.categorySlug)
    .filter(
      (p: PostLite) => p.indexable !== false && p.draft !== true
    ) as PostLite[];

  const categories = Array.from(new Set(clean.map((p) => p.categorySlug)));

  const items: MetadataRoute.Sitemap = [
    { url: `${BASE}`, changeFrequency: "daily", priority: 0.8 },
    ...categories.map((c) => ({
      url: `${BASE}/${c}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...clean.map((p) => ({
      url: `${BASE}/${p.categorySlug}/${p.slug}`,
      lastModified: toDateSafe(p.updatedAt ?? p.createdAt ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return items;
}
