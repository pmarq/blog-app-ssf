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
};

export default nextConfig;
