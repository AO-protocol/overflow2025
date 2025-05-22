"use client";

import { isClient } from "@/lib/utils-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

// Define networks for the provider
const networks = {
  mainnet: { url: "https://fullnode.mainnet.sui.io/" },
  testnet: { url: "https://fullnode.testnet.sui.io/" },
  devnet: { url: "https://fullnode.devnet.sui.io/" },
};

// Dynamically import wallet components with SSR disabled
const DynamicWalletProviders = dynamic(
  () => import("./wallet-providers").then((mod) => mod.WalletProviders),
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  // Only show UI after component is mounted on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        {mounted && isClient ? (
          <DynamicWalletProviders networks={networks}>
            {children}
          </DynamicWalletProviders>
        ) : (
          children
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
