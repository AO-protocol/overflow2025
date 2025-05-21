import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  /* config options here */
  devIndicators: {
    buildActivity: true,
  },
  // ウォレット関連コンポーネントのビルドエラーを修正
  experimental: {
    // SSRの最適化の際にクライアントサイドのコードを適切に処理
    optimizePackageImports: ['@mysten/dapp-kit', '@tanstack/react-query']
  },
};

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // PWA関連のブラウザ限定機能のSSRエラーを防止
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);

export default config;
