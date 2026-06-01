"use client";

import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmiConfig";
import "@rainbow-me/rainbowkit/styles.css";

// Global fetch interceptor to proxy Circle API requests through local route handler (bypassing CORS preflight headers)
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("api.circle.com")) {
      url = url.replace("https://api.circle.com", "/api/circle");
      
      if (typeof input === "string") {
        input = url;
      } else if (input instanceof URL) {
        input = new URL(url, window.location.origin);
      } else {
        input = new Request(url, input);
      }
    }

    return originalFetch(input, init);
  };
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#0284c7", // Sky-600 for light theme
            accentColorForeground: "white",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
