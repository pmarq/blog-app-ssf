// next.config.js (BLOG inlevor)

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? "/blog" : "",
  trailingSlash: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  // ──────── Server Actions ────────
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",

      // Domínios que o navegador mostra ao usuário
      allowedOrigins: ["inlevor.com.br", "www.inlevor.com.br"],

      // Hosts que chegam no cabeçalho `x-forwarded-host`
      // enviado pelo edge (Vercel). Use o curinga se
      // pretender mais subdomínios.
      allowedForwardedHosts: [
        "blog-app-cloudinary-v3.vercel.app",
        // '*.vercel.app'  // ← se mudar de pré-visualização constantemente
      ],
    },
  },
};

module.exports = nextConfig;
