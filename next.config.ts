import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow production build even when TypeScript type errors exist. */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
