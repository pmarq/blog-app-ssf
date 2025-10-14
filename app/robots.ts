// app/robots.ts
import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://inlevor.com.br";

// Importante: como o projeto roda em /blog (basePath), o sitemap também deve apontar para /blog/sitemap.xml
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE}/blog/sitemap.xml`,
    // "host" é opcional. Se quiser manter, use só o domínio:
    host: "inlevor.com.br",
  };
}
