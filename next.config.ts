import type { NextConfig } from "next";

const DEFAULT_BACKEND = "https://padhai-backend-qbw5.onrender.com";
const backend = DEFAULT_BACKEND

  .trim()
  .replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
