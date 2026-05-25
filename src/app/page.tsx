"use client";

import React, { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { SwapWidget } from "@/components/SwapWidget";
import { BridgeWidget } from "@/components/BridgeWidget";
import { GatewayWidget } from "@/components/GatewayWidget";
import { ArrowLeftRight, HelpCircle, Layers, ArrowUpRight } from "lucide-react";

type TabId = "swap" | "bridge" | "gateway";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("swap");

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/20 via-zinc-950 to-zinc-950">
      
      {/* Visual Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Navigation Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Layers className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                Arc Network
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/25 font-semibold">
                  Starter Kit
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">Powered by Circle App Kit</p>
            </div>
          </div>

          <WalletConnect />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center">
        
        {/* Banner Section */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400">
            Developer Playground
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto font-medium">
            Deploy swaps, cross-chain bridges, and unified balance commands on Arc Network using native USDC gas.
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex p-1.5 rounded-2xl bg-zinc-950 border border-zinc-900 mb-8 max-w-md w-full shadow-inner">
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "swap"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Swap</span>
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "bridge"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Bridge</span>
          </button>
          <button
            onClick={() => setActiveTab("gateway")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "gateway"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Gateway</span>
          </button>
        </div>

        {/* Tab Render Box */}
        <div className="w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {activeTab === "swap" && <SwapWidget />}
          {activeTab === "bridge" && <BridgeWidget />}
          {activeTab === "gateway" && <GatewayWidget />}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 font-medium">
          <div className="flex items-center gap-3">
            <span>&copy; 2026 Arc Starter Kit. MIT License.</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://rpc.testnet.arc.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors flex items-center gap-1"
            >
              RPC
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors flex items-center gap-1"
            >
              ArcScan
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors flex items-center gap-1"
            >
              Faucet
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
