// app/robots.ts
import type { MetadataRoute } from "next";

/* ── helpers ─────────────────────────────── */
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function getOriginAndBasePath() {
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

  const envBase = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const basePath = baseFromUrl || envBase;

  return {
    origin,
    basePath: basePath ? ensureLeadingSlash(basePath) : "",
  };
}

/* ── robots ──────────────────────────────── */
export default function robots(): MetadataRoute.Robots {
  const { origin, basePath } = getOriginAndBasePath();
  const sitemapUrl = `${origin}${basePath || ""}/sitemap.xml`; // ok com/sem /blog

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: sitemapUrl,
    host: "inlevor.com.br",
  };
}
