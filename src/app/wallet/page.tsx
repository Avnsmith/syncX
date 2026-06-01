"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUsdcBalance, useEurcBalance, useCirBtcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { AssetCard } from "@/components/AssetCard";
import { RefreshCw, Wallet, LayoutGrid } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";

export default function WalletPage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: usdcBal, refetch: refetchUsdc, isFetching: fetchingUsdc } = useUsdcBalance(address);
  const { data: eurcBal, refetch: refetchEur, isFetching: fetchingEur } = useEurcBalance(address);
  const { data: cirBtcBal, refetch: refetchCirBtc, isFetching: fetchingCirBtc } = useCirBtcBalance(address);

  const refetchAll = () => {
    if (refetchUsdc) refetchUsdc();
    if (refetchEur) refetchEur();
    if (refetchCirBtc) refetchCirBtc();
  };

  const isFetching = fetchingUsdc || fetchingEur || fetchingCirBtc;

  // Formatting helpers
  const formatBalance = (val: bigint | undefined, decimals: number, precision = 2) => {
    if (val === undefined) return "0.00";
    const formatted = parseFloat(formatUnits(val, decimals));
    return formatted.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  const usdcString = formatBalance(usdcBal, 6, 2);
  const eurcString = formatBalance(eurcBal, 6, 2);
  const cirBtcString = formatBalance(cirBtcBal, 8, 6);

  // Fallback copy helper
  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    alert("Wallet address copied to clipboard!");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen p-6 max-w-5xl mx-auto flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading wallet...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto bg-slate-50">
      
      {/* Header and Connect section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-8 w-8 text-sky-600" />
            Wallet Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time balance tracking for stablecoins and digital assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <button
              onClick={refetchAll}
              disabled={isFetching}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="text-xs font-bold hidden sm:inline">Refresh</span>
            </button>
          )}
          <WalletConnect />
        </div>
      </div>

      {!isConnected ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-md">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Wallet className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-950 mb-2">Connect Wallet</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Please connect your wallet using the button below to view your real-time on-chain balances and transfer history.
          </p>
          <WalletConnect />
        </section>
      ) : (
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AssetCard
              name="USD Coin"
              symbol="USDC"
              balance={usdcString}
              usdValue={usdcString}
              address={address}
              onSend={() => {
                window.location.href = `/send?asset=USDC`;
              }}
              onReceive={() => {
                alert(`USDC Address Copied to Clipboard:\n${address}`);
                navigator.clipboard.writeText(address || "");
              }}
            />

            <AssetCard
              name="Euro Coin"
              symbol="EURC"
              balance={eurcString}
              usdValue={(parseFloat(eurcString.replace(/,/g, "")) * 1.08).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              address={address}
              onSend={() => {
                window.location.href = `/send?asset=EURC`;
              }}
              onReceive={() => {
                alert(`EURC Address Copied to Clipboard:\n${address}`);
                navigator.clipboard.writeText(address || "");
              }}
            />

            <AssetCard
              name="Circle Bitcoin"
              symbol="cirBTC"
              balance={cirBtcString}
              usdValue={(parseFloat(cirBtcString.replace(/,/g, "")) * 68500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              address={address}
              onSend={() => {
                window.location.href = `/send?asset=cirBTC`;
              }}
              onReceive={() => {
                alert(`cirBTC Address Copied to Clipboard:\n${address}`);
                navigator.clipboard.writeText(address || "");
              }}
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">SyncX Dashboard</h4>
                <p className="text-xs text-slate-500 font-medium">Head back to execute stablecoin swaps or bridges.</p>
              </div>
            </div>
            <Link
              href="/"
              className="py-2.5 px-5 text-center rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs transition-all shadow-inner"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
