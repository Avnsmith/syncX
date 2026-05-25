import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBridge } from "@/hooks/useBridge";
import { BRIDGE_CHAINS } from "@/config/tokens";
import { estimateBridgeFee, type SupportedChain } from "@/services/bridgeService";
import { useUsdcBalance, useEurcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { ArrowRight, Loader2, Info, User } from "lucide-react";
import { TxStatus } from "./TxStatus";

export function BridgeWidget() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address, chain } = useAccount();
  const { bridge, loading, error, result } = useBridge();

  const [fromChain, setFromChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[0]); // Arc Testnet
  const [toChain, setToChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[1]); // Ethereum Sepolia
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [speedMode, setSpeedMode] = useState<"fast" | "standard">("fast");
  const [estimatedFee, setEstimatedFee] = useState<string>("0.01");
  const [txStep, setTxStep] = useState<"pending" | "attesting" | "minting" | "complete" | "failed">("pending");

  // Load user's balance
  const { data: usdcBal } = useUsdcBalance(address, fromChain.id);
  const { data: eurcBal } = useEurcBalance(address, fromChain.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getBalance = () => {
    if (token === "USDC") return usdcBal ? formatUnits(usdcBal, 6) : "0";
    if (token === "EURC") return eurcBal ? formatUnits(eurcBal, 6) : "0";
    return "0";
  };

  const balanceText = (mounted && isConnected) ? parseFloat(getBalance()).toFixed(2) : "0.00";

  // Pre-fill recipient address with active account
  useEffect(() => {
    if (address && !recipient) {
      setRecipient(address);
    }
  }, [address, recipient]);

  // Update estimated fee when chains change
  useEffect(() => {
    const fetchFee = async () => {
      const fee = await estimateBridgeFee({
        fromChain: fromChain.appKitId as SupportedChain,
        toChain: toChain.appKitId as SupportedChain,
        token,
        amount: amount || "0",
      });
      setEstimatedFee(fee);
    };
    fetchFee();
  }, [fromChain, toChain, token, amount]);

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !recipient) return;

    setTxStep("pending");
    try {
      const res = await bridge({
        fromChain: fromChain.appKitId as SupportedChain,
        toChain: toChain.appKitId as SupportedChain,
        token,
        amount,
      });

      if (res && res.sourceTxHash) {
        // Mocking stages of CCTP for visual feedback during testnet demonstration
        setTxStep("attesting");
        setTimeout(() => {
          setTxStep("minting");
          setTimeout(() => {
            setTxStep("complete");
          }, speedMode === "fast" ? 6000 : 15000);
        }, speedMode === "fast" ? 4000 : 10000);
      } else {
        setTxStep("failed");
      }
    } catch (err) {
      setTxStep("failed");
    }
  };

  const isChainMismatched = mounted && isConnected && chain?.id !== fromChain.id;

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>Bridge Stablecoin</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            Circle CCTP
          </span>
        </h2>
      </div>

      <form onSubmit={handleBridge} className="space-y-4">
        {/* Chain Selector (From / To) */}
        <div className="grid grid-cols-9 items-center gap-2">
          <div className="col-span-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Source Chain</span>
            <select
              value={fromChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) {
                  setFromChain(found);
                  if (toChain.id === id) {
                    setToChain(BRIDGE_CHAINS.find(c => c.id !== id) || fromChain);
                  }
                }
              }}
              className="w-full bg-transparent text-sm font-semibold text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {BRIDGE_CHAINS.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwapChains}
              disabled={loading}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-sky-400 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="col-span-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Dest Chain</span>
            <select
              value={toChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) {
                  setToChain(found);
                  if (fromChain.id === id) {
                    setFromChain(BRIDGE_CHAINS.find(c => c.id !== id) || toChain);
                  }
                }
              }}
              className="w-full bg-transparent text-sm font-semibold text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {BRIDGE_CHAINS.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-zinc-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Token and Amount Input */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>Send Amount</span>
            <span>Balance: {balanceText} {token}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none [appearance:textfield]"
              required
              min="0.000001"
              step="any"
              disabled={loading}
            />
            <select
              value={token}
              onChange={(e) => setToken(e.target.value as "USDC" | "EURC")}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm font-semibold text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="USDC" className="bg-zinc-950 text-zinc-200">USDC</option>
              <option value="EURC" className="bg-zinc-950 text-zinc-200">EURC</option>
            </select>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 focus-within:border-sky-500/50 transition-all">
          <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-zinc-600" />
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none"
            required
            disabled={loading}
          />
        </div>

        {/* Speed Selection */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-900">
          <button
            type="button"
            onClick={() => setSpeedMode("fast")}
            className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              speedMode === "fast"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
            disabled={loading}
          >
            Fast (~15s)
          </button>
          <button
            type="button"
            onClick={() => setSpeedMode("standard")}
            className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              speedMode === "standard"
                ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
            disabled={loading}
          >
            Standard (~15 min)
          </button>
        </div>

        {/* Fee estimation and timing information */}
        <div className="p-3.5 rounded-2xl border border-zinc-900 bg-zinc-900/30 space-y-2.5 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Bridge Gas Fee</span>
            <span className="font-semibold text-zinc-200">
              {fromChain.appKitId === "Arc_Testnet" 
                ? `~ ${estimatedFee} USDC (Paid in USDC, NO ETH required!)` 
                : `~ ${fromChain.appKitId === "Ethereum_Sepolia" ? "0.0015" : "0.0001"} ETH (Paid in ETH)`}
            </span>
          </div>
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="flex justify-between border-t border-zinc-800/50 pt-2 font-medium">
              <span className="text-zinc-300">You Receive (Estimated)</span>
              <span className="text-emerald-400 font-bold">
                {Math.max(0, parseFloat(amount) - (token === "USDC" ? parseFloat(estimatedFee) : 0)).toFixed(2)} {token}
              </span>
            </div>
          )}
          <div className="flex justify-between items-start gap-1 border-t border-zinc-800/50 pt-2">
            <span className="flex items-center gap-1">
              Bridge Protocol <Info className="h-3 w-3 text-zinc-600" />
            </span>
            <span className="text-zinc-500 text-right">No wrapping, mints native asset on destination via CCTP</span>
          </div>
        </div>

        {/* Submit Button */}
        {(!mounted || !isConnected) ? (
          <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-zinc-800 text-zinc-500 rounded-2xl">
            Please connect wallet to bridge
          </div>
        ) : isChainMismatched ? (
          <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-rose-900/30 text-rose-400/80 rounded-2xl bg-rose-500/5">
            Switch chain to {fromChain.name} to send
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !amount || !recipient}
            className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-400 hover:to-indigo-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Bridge...</span>
              </>
            ) : (
              <span>Bridge stablecoin</span>
            )}
          </button>
        )}
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs text-center">
          {error}
        </div>
      )}

      {/* CCTP Progress visualizer */}
      {result && result.sourceTxHash && (
        <TxStatus txHash={result.sourceTxHash} status={txStep} type="bridge" />
      )}
    </div>
  );
}
