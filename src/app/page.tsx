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
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-50">
      
      {/* Visual Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Dashboard Sub-Header with Wallet Connection */}
      <div className="border-b border-slate-100 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">Fintech Portal</h2>
            <p className="text-xs text-slate-500 font-medium">Manage assets, stablecoin swaps, and cross-chain transfers</p>
          </div>
          <WalletConnect />
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-8 sm:py-12 flex flex-col items-center">
        
        {/* Banner Section */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700">
            SyncX Financial Hub
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Seamlessly execute stablecoin swaps, CCTP cross-chain bridges, and unified balance commands with institutional-grade latency.
          </p>
        </div>
 
        {/* Custom Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/40 mb-8 max-w-md w-full shadow-inner">
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "swap"
                ? "bg-white text-slate-900 border border-slate-200/60 shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Stablecoin Swap</span>
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "bridge"
                ? "bg-white text-slate-900 border border-slate-200/60 shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Cross-chain Bridge</span>
          </button>
          <button
            onClick={() => setActiveTab("gateway")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "gateway"
                ? "bg-white text-slate-900 border border-slate-200/60 shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Unified Gateway</span>
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
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>&copy; 2026 SyncX. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://rpc.testnet.arc.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              RPC Endpoint
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              Block Explorer
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              Stablecoin Faucet
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
