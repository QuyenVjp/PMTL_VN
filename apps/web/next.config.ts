import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@pmtl/shared", "@pmtl/ui"],
};

export default nextConfig;

