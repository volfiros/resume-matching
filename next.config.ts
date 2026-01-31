import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Add empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
};

export default nextConfig;
