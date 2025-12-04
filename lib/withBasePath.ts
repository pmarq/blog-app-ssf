// lib/withBasePath.ts
const DEFAULT_PROD_BASE = "/blog";

/**
 * Prefixes a path with the configured basePath. In production, defaults to
 * "/blog" if NEXT_PUBLIC_BASE_PATH is not set (matches next.config.js).
 */
export const withBasePath = (path: string) => {
  const rawBase =
    process.env.NEXT_PUBLIC_BASE_PATH ??
    (process.env.NODE_ENV === "production" ? DEFAULT_PROD_BASE : "");

  const base = rawBase?.endsWith("/") ? rawBase.slice(0, -1) : rawBase || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
};
