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
  experimental: {
    trustHostHeader: true,
    serverActions: { bodySizeLimit: "10mb" },
  },
};

module.exports = nextConfig;
