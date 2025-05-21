"use client";

import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define message type locally to avoid dependency issues
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ChatMessage({
  message,
  isFavorite,
  onToggleFavorite,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  // This is a simple detection of product recommendations in the AI response
  // In a real app, you would have structured data from your backend
  const hasProductRecommendation =
    !isUser &&
    (message.content.includes("recommend") ||
      message.content.includes("option") ||
      message.content.includes("$") ||
      message.content.includes("¥"));

  return (
    <div
      className={cn(
        "flex w-full group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-4 py-3 relative",
          isUser
            ? "bg-[#4872cc]/10 text-foreground"
            : "bg-background border border-muted-foreground/10 shadow-sm"
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert break-words whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Show product recommendations if AI message contains product suggestions */}
        {hasProductRecommendation && !isUser && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ProductCard
              name="Acer Swift 3"
              price="$699.99"
              description="Lightweight laptop with AMD Ryzen 5, 8GB RAM, 512GB SSD"
              imageUrl="/placeholder.svg?height=200&width=300"
            />
            <ProductCard
              name="ASUS VivoBook 15"
              price="$649.99"
              description="Thin and light with Intel Core i5, 8GB RAM, 256GB SSD"
              imageUrl="/placeholder.svg?height=200&width=300"
            />
          </div>
        )}

        {/* Favorite button - only show for AI messages */}
        {!isUser && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -top-2 -right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm",
              isFavorite && "opacity-100 text-[#4872cc]"
            )}
            onClick={onToggleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-[#4872cc]")} />
            <span className="sr-only">Favorite</span>
          </Button>
        )}
      </div>
    </div>
  );
}
