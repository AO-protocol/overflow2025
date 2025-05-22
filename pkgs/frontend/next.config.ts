import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  /* config options here */
  devIndicators: {
    buildActivity: true,
  },
  // Fixed build errors in wallet-related components
  experimental: {
    // Proper handling of client-side code during SSR optimization
    optimizePackageImports: ["@mysten/dapp-kit", "@tanstack/react-query"],
  },
};

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Prevent SSR errors in PWA-related browser-only functions
  disable: process.env.NODE_ENV === "development",
})(nextConfig);

export default config;
