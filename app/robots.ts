// app/robots.ts
import type { MetadataRoute } from "next";

const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");

// ORIGIN: só domínio (sem /blog, sem barra final)
const ORIGIN = stripTrailingSlash(
  process.env.NEXT_PUBLIC_BASE_URL
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://inlevor.com.br"
);

// basePath do app (em prod é /blog; em dev pode ser vazio)
const RAW_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/blog";
const BASE_PATH = trimSlashes(RAW_BASE_PATH); // "blog" ou ""

export default function robots(): MetadataRoute.Robots {
  // monta /<basePath>/sitemap.xml apenas se houver basePath
  const sitemapPath = BASE_PATH ? `/${BASE_PATH}/sitemap.xml` : `/sitemap.xml`;

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${ORIGIN}${sitemapPath}`,
    host: "inlevor.com.br",
  };
}
