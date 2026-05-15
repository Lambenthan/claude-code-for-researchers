import type { NextConfig } from "next";

// When deploying to GitHub Pages as a project page, the site lives under
// `/claude-code-for-researchers/` rather than `/`. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH to that prefix; local dev leaves it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
