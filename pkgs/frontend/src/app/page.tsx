"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Loader2, AlertCircle, Send } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { FavoritesSidebar } from "@/components/favorites-sidebar";
import { UserMenu } from "@/components/user-menu";
import { Footer } from "@/components/footer";
import { WalletStatus } from "@/components/wallet-status";

// Define message type locally to avoid dependency issues
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Page() {
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for favorites and UI
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add to favorites
  const toggleFavorite = (message: Message) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) {
        return prev.filter((m) => m.id !== message.id);
      } else {
        return [...prev, message];
      }
    });
  };

  // Check if message is favorited
  const isFavorite = (messageId: string) => {
    return favorites.some((m) => m.id === messageId);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Create a user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    // Add user message to the chat
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Send request to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Update messages with the response
      if (data.messages && Array.isArray(data.messages)) {
        // API returned full message history
        setMessages(data.messages);
      } else if (data.message) {
        // API returned just the new message
        setMessages((prev) => [...prev, data.message]);
      } else {
        // Fallback if response format is unexpected
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "申し訳ありませんが、応答の処理中に問題が発生しました。もう一度お試しください。",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while sending the message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when input changes
  useEffect(() => {
    if (error && input) {
      setError(null);
    }
  }, [input, error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h1 className="text-xl font-bold text-[#4872cc]">AO</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-[#4872cc]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favorites</span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-4 p-4 md:p-6 pb-20">
              {messages.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">

                  <h2 className="text-2xl font-medium tracking-tight text-[#4872cc]">
                    Welcome to AO
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Ask me about any product you're looking for, and I'll help
                    you find the best options.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[
                      "Find wireless headphones under $100",
                      "Recommend a lightweight laptop for students",
                      "Best coffee makers for small kitchens",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        className="rounded-full text-sm border-[#4872cc] text-[#4872cc] hover:bg-[#4872cc]/10"
                        onClick={() => {
                          setInput(suggestion);
                          handleSubmit(new Event("submit") as any);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isFavorite={isFavorite(message.id)}
                    onToggleFavorite={() => toggleFavorite(message)}
                  />
                ))
              )}

              {/* Wallet Status Card */}
              {messages.length === 0 && (
                <div className="mt-8 max-w-md mx-auto">
                  <WalletStatus />
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-500 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">An error has occurred.</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <div className="flex items-center gap-2 text-[#4872cc]">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Generating response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </main>

        {/* Favorites sidebar */}
        <FavoritesSidebar
          favorites={favorites}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="e.g. Find wireless headphones under $100"
            className="flex-1 rounded-full border-[#4872cc]/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-[#4872cc] hover:bg-[#4872cc]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </form>
        <Footer />
      </div>
    </div>
  );
}
