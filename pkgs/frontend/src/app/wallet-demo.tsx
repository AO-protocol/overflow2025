"use client";

import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

// Mock wallet data for demonstration
const MOCK_WALLET = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  publicKey: "0xabcdef1234567890abcdef1234567890abcdef12",
  chains: ["sui:mainnet"],
  features: ["signMessage", "signTransaction"],
};

export default function WalletDemo() {
  const [connected, setConnected] = useState(false);

  // Toggle mock connection
  const toggleConnection = () => {
    setConnected(!connected);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#4872cc] mb-2">
            Sui Wallet demo
          </h1>
          <p className="text-muted-foreground">
            This demo simulates a real wallet connection
          </p>
        </div>

        <div className="mb-6">
          <WalletConnect />
        </div>

        <div className="bg-muted/50 p-4 rounded-xl">
          <h2 className="font-medium mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Demo Controls
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Wallet connection status can be simulated
          </p>
          <Button
            onClick={toggleConnection}
            className="w-full rounded-full bg-[#4872cc] hover:bg-[#4872cc]/90"
          >
            {connected
              ? "Disconnect Wallet"
              : "Simulate wallet connection"}
          </Button>

          {connected && (
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-medium">Simulated Wallet Information:</p>
              <pre className="mt-1 p-2 bg-muted rounded overflow-x-auto">
                {JSON.stringify(MOCK_WALLET, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
