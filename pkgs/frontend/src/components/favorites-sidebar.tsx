"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Define message type locally to avoid dependency issues
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface FavoritesSidebarProps {
  favorites: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function FavoritesSidebar({
  favorites,
  isOpen,
  onClose,
}: FavoritesSidebarProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-80 bg-background border-l border-border transform transition-transform duration-200 ease-in-out z-20 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full md:w-0 md:border-l-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-[#4872cc]" /> Favorite
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="md:hidden"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4">
            <Heart className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No favorites yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click on the heart icon in the message to save it.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="rounded-xl border p-3 text-sm hover:bg-muted/50 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {favorite.role === "user" ? "あなた" : "AO"}:
                </div>
                <div className="line-clamp-4">{favorite.content}</div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
