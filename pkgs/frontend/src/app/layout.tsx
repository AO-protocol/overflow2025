import { Providers } from "@/components/providers";
import "@/styles/globals.css";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Sui Wallet Connection",
  description: "Simple UI for connecting to Sui wallet",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
