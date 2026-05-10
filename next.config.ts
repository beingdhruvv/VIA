import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Google Sign-In profile photos (lh*.googleusercontent.com)
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh4.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh5.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh6.googleusercontent.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "via.stromlabs.tech",
        "www.via.stromlabs.tech",
      ],
    },
  },
};

export default nextConfig;
