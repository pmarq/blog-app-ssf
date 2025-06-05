import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* outras configurações do Next.js */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // Permite todas as rotas dentro de res.cloudinary.com
      },
    ],
  },
  /* ───── novo bloco ───── */
  async rewrites() {
    return [
      {
        source: "/blog/:path*",
        destination: "https://blog-app-cloudinary-v3.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
