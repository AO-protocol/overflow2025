"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";

export function WalletStatus() {
  const account = useCurrentAccount();
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Format wallet address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom connect handler
  const handleConnect = () => {
    setConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      setConnecting(false);

      // Show alert with instructions (in a real app, this would trigger the wallet connection)
      alert(
        "実際の実装では、ここでウォレット選択モーダルが表示されます。\n\nv0環境の制限により、実際のウォレット接続はシミュレーションのみとなります。\n\n実際のアプリでは、@mysten/dapp-kitのConnectButtonまたはuseWalletフックを使用して接続します。"
      );

      // For demo purposes, you could redirect to Sui wallet website
      if (confirm("Sui Walletのウェブサイトを開きますか？")) {
        window.open("https://sui.io/wallet", "_blank");
      }
    }, 1500);
  };

  return (
    <Card className="shadow-sm border-[#4872cc]/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#4872cc]" />
          Wallet Status
        </CardTitle>
        <CardDescription>
          Connect your Sui wallet to access all features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {account ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
              <div className="text-sm font-medium">
                {formatAddress(account.address)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={copyAddress}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Your wallet is connected. You can now access all features.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-sm text-center text-muted-foreground mb-2">
              Connect your wallet to access personalized recommendations and
              features
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-full bg-[#4872cc] hover:bg-[#4872cc]/90 text-white"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Wallet
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Wallet connection is simulated in v0 environment
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
