import { CoinsIcon as Coin } from "lucide-react";

export function Footer() {
  return (
    <div className="mx-auto max-w-3xl mt-2 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Coin className="h-3 w-3" />
        <span>Token Balance: 120</span>
      </div>
      <div>
        <span>Rewards: +5 for product feedback</span>
      </div>
    </div>
  );
}
