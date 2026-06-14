import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server and only the modules
  // it actually imports, which is what the runtime stage of the Dockerfile
  // copies instead of the whole node_modules tree.
  output: "standalone",
  poweredByHeader: false,
  // The floating dev badge overlaps the sidebar in captured screenshots.
  devIndicators: false,
};

export default nextConfig;
