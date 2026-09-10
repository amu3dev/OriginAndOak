import type { NextConfig } from "next";

const nextConfig: NextConfig =
  process.env.CLOUDFLARE_BUILD === "1"
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {};

export default nextConfig;
