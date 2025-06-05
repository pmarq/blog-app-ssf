/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) prefixa todas as rotas/arquivos estáticos com /blog
  basePath: "/blog",
  trailingSlash: false, // (opcional) evita /blog/page/ → /blog/page

  // 2) imagens remotas – mantém as mesmas regras
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

  // 3) se você usava algo em experimental, mantenha aqui
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

module.exports = nextConfig;
