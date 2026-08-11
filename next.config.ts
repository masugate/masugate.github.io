import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  typescript: {
    tsconfigPath:
      process.env.PAGES_BUILD === "1" ? "tsconfig.pages.json" : "tsconfig.json",
  },
};

export default nextConfig;
