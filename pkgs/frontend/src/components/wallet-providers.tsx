"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { ReactNode } from "react";

interface WalletProvidersProps {
  children: ReactNode;
  networks: {
    mainnet: { url: string };
    testnet: { url: string };
    devnet: { url: string };
  };
}

export function WalletProviders({ children, networks }: WalletProvidersProps) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="mainnet">
      <WalletProvider>{children}</WalletProvider>
    </SuiClientProvider>
  );
}
