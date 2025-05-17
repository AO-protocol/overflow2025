declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCaching {
    urlPattern: RegExp | string;
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      networkTimeoutSeconds?: number;
      cacheableResponse?: {
        statuses: number[];
      };
    };
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: Array<string | RegExp>;
    publicExcludes?: Array<string | RegExp>;
    fallbacks?: {
      [key: string]: string;
    };
    cacheOnFrontEndNav?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    subdomainPrefix?: string;
    customWorkerDir?: string;
  }

  export default function withPWA(
    config?: PWAConfig
  ): (nextConfig: NextConfig) => NextConfig;
}
