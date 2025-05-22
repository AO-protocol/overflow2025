"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Wallet, Copy, CheckCircle, Loader2, ExternalLink } from "lucide-react";

export function WalletConnect() {
  const account = useCurrentAccount();
  const [copied, setCopied] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle data loading simulation when data sharing is enabled
  useEffect(() => {
    if (dataSharing) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [dataSharing]);

  // Custom connect handler
  const handleConnect = () => {
    setConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      setConnecting(false);

      // Show alert with instructions (in a real app, this would trigger the wallet connection)
      alert(
        "Wallet selection modal appears"
      );

      // For demo purposes, you could redirect to Sui wallet website
      if (confirm("Open Sui Wallet website?")) {
        window.open("https://sui.io/wallet", "_blank");
      }
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-[#4872cc]/10 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wallet className="h-5 w-5 text-[#4872cc]" />
          Sui Wallet
        </CardTitle>
        <CardDescription>
          Connect to your Sui Wallet to access all features!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {account ? (
          <>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Wallet Address
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
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
                  <span className="sr-only">Address copy </span>
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Share data</div>
                <Switch
                  checked={dataSharing}
                  onCheckedChange={setDataSharing}
                  aria-label="Switching data sharing"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <div className="flex items-center text-[#4872cc]">
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Loading data...
                  </div>
                ) : (
                  "Provides personalized recommendations using wallet data"
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="text-center text-muted-foreground">
              Connect to your Wallet and start your personalized experience!
            </div>

            {/* Custom connect button */}
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-full bg-[#4872cc] hover:bg-[#4872cc]/90 text-white px-6 py-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect wallet
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground mt-2 text-center">
              <p>Connect with @mysten/dapp-kit</p>
            </div>
          </div>
        )}
      </CardContent>
      {account && (
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Wallet has been successfully connected. All functions are accessible.
        </CardFooter>
      )}
    </Card>
  );
}
