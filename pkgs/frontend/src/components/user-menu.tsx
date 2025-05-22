"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCircle2, Wallet, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function UserMenu() {
  const [dataSharing, setDataSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const account = useCurrentAccount();
  const [connecting, setConnecting] = useState(false);

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

  // Format wallet address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Custom connect handler
  const handleConnect = () => {
    setConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      setConnecting(false);

      // Show alert with instructions (in a real app, this would trigger the wallet connection)
      alert(
        "Here you will see the wallet selection modal\n\nv0環境の制限により、実際のウォレット接続はシミュレーションのみとなります。\n\n実際のアプリでは、@mysten/dapp-kitのConnectButtonまたはuseWalletフックを使用して接続します。"
      );

      // For demo purposes, you could redirect to Sui wallet website
      if (confirm("Open Sui Wallet website?")) {
        window.open("https://sui.io/wallet", "_blank");
      }
    }, 1500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle2 className="h-6 w-6" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2">
          <div className="rounded-lg bg-muted p-2 mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4" />
              Wallet Status
            </div>
            <div className="text-xs mt-1 flex items-center justify-between">
              {account ? (
                <span className="text-[#4872cc] font-medium">
                  {formatAddress(account.address)}
                </span>
              ) : (
                <span className="text-muted-foreground">Not connected</span>
              )}
              <Button
                onClick={handleConnect}
                disabled={connecting}
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-full border-[#4872cc] text-[#4872cc] hover:bg-[#4872cc]/10"
              >
                {connecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        </div>

        {account && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Data Sharing</div>
                <Switch
                  checked={dataSharing}
                  onCheckedChange={setDataSharing}
                  aria-label="Toggle data sharing"
                />
              </div>
              <div className="flex items-center mt-1">
                {isLoading ? (
                  <div className="flex items-center text-xs text-[#4872cc]">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading data...
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Allow AO to use your wallet data to improve recommendations
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
