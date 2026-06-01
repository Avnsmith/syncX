import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSwap } from "@/hooks/useSwap";
import { ARC_TESTNET_TOKENS, type TokenConfig } from "@/config/tokens";
import { useUsdcBalance, useEurcBalance, useCirBtcBalance } from "@/hooks/useTokenBalance";
import { estimateSwapOnArc } from "@/services/swapService";
import { formatUnits } from "viem";
import { ArrowDownUp, RefreshCw, HelpCircle, Loader2 } from "lucide-react";
import { TxStatus } from "./TxStatus";

export function SwapWidget() {
  const { isConnected, address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { swap, loading, error, result } = useSwap();

  const [mounted, setMounted] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [tokenIn, setTokenIn] = useState<TokenConfig>(ARC_TESTNET_TOKENS[0]); // USDC
  const [tokenOut, setTokenOut] = useState<TokenConfig>(ARC_TESTNET_TOKENS[1]); // EURC
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [txStatus, setTxStatus] = useState<"pending" | "complete" | "failed">("pending");

  const [btcPrice, setBtcPrice] = useState<number>(68500); // Live BTC price fallback
  const [eurPrice, setEurPrice] = useState<number>(1.085); // Live EUR price fallback

  const { data: usdcBal, refetch: refetchUsdc } = useUsdcBalance(address);
  const { data: eurcBal, refetch: refetchEur } = useEurcBalance(address);
  const { data: cirBtcBal, refetch: refetchCirBtc } = useCirBtcBalance(address);

  const ARC_TESTNET_CHAIN_ID = 5042002;
  const isCorrectChain = chain?.id === ARC_TESTNET_CHAIN_ID;

  // Poll live exchange rates from public Coinbase APIs (zero CORS, zero API keys)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const btcRes = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
        const btcData = await btcRes.json();
        if (btcData?.data?.amount) {
          setBtcPrice(parseFloat(btcData.data.amount));
        }

        const eurRes = await fetch("https://api.coinbase.com/v2/prices/EUR-USD/spot");
        if (eurRes.ok) {
          const eurData = await eurRes.json();
          if (eurData?.data?.amount) {
            setEurPrice(parseFloat(eurData.data.amount));
          }
        }
      } catch (err) {
        console.error("Error fetching live rates:", err);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple token balance helper
  const getTokenBalance = (symbol: string) => {
    if (symbol === "USDC") return usdcBal ? formatUnits(usdcBal, 6) : "0";
    if (symbol === "EURC") return eurcBal ? formatUnits(eurcBal, 6) : "0";
    if (symbol === "cirBTC") return cirBtcBal ? formatUnits(cirBtcBal, 8) : "0";
    return "0";
  };

  const balanceIn = (mounted && isConnected) ? parseFloat(getTokenBalance(tokenIn.symbol)).toFixed(tokenIn.symbol === "cirBTC" ? 6 : 2) : "0.00";
  const balanceOut = (mounted && isConnected) ? parseFloat(getTokenBalance(tokenOut.symbol)).toFixed(tokenOut.symbol === "cirBTC" ? 6 : 2) : "0.00";

  // Calculate dynamic exchange rates based on live on-chain quoting & public price feeds
  useEffect(() => {
    if (!amountIn || isNaN(parseFloat(amountIn))) {
      setAmountOut("");
      return;
    }

    setIsEstimating(true);

    const getQuote = async () => {
      try {
        if (walletClient && isConnected && isCorrectChain) {
          // Attempt real-time ON-CHAIN quotation via SDK!
          const realQuote = await estimateSwapOnArc({
            tokenIn: tokenIn.symbol,
            tokenOut: tokenOut.symbol,
            amount: amountIn,
            walletClient,
          });
          setAmountOut(parseFloat(realQuote).toFixed(tokenOut.symbol === "cirBTC" ? 8 : 6));
          setIsEstimating(false);
          return;
        }
      } catch (err) {
        console.warn("On-chain estimate fallback to Coinbase price feeds...", err);
      }

      // Fallback calculation using live Coinbase market spot prices if not connected
      const val = parseFloat(amountIn);
      if (tokenIn.symbol === "USDC" && tokenOut.symbol === "EURC") {
        setAmountOut((val / eurPrice).toFixed(6));
      } else if (tokenIn.symbol === "EURC" && tokenOut.symbol === "USDC") {
        setAmountOut((val * eurPrice).toFixed(6));
      } else if (tokenIn.symbol === "USDC" && tokenOut.symbol === "cirBTC") {
        setAmountOut((val / btcPrice).toFixed(8));
      } else if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "USDC") {
        setAmountOut((val * btcPrice).toFixed(6));
      } else if (tokenIn.symbol === "EURC" && tokenOut.symbol === "cirBTC") {
        setAmountOut(((val * eurPrice) / btcPrice).toFixed(8));
      } else if (tokenIn.symbol === "cirBTC" && tokenOut.symbol === "EURC") {
        setAmountOut(((val * btcPrice) / eurPrice).toFixed(6));
      } else {
        setAmountOut(val.toFixed(6));
      }
      setIsEstimating(false);
    };

    // Debounce to optimize API queries naturally
    const timer = setTimeout(getQuote, 500);
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut, btcPrice, eurPrice, walletClient, isConnected, isCorrectChain]);

  const handleFlip = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountIn || isNaN(parseFloat(amountIn))) return;
    
    setTxStatus("pending");
    try {
      const res = await swap({
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amount: amountIn,
      });
      if (res && res.txHash) {
        setTxStatus("complete");
        // Dynamic balance refresh
        refetchUsdc();
        refetchEur();
        refetchCirBtc();
      } else {
        setTxStatus("failed");
      }
    } catch (err) {
      setTxStatus("failed");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Swap Tokens</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Arc Testnet
          </span>
        </h2>
      </div>

      <form onSubmit={handleSwap} className="space-y-4">
        {/* Token In Input */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-semibold">
            <span>Pay</span>
            <span>Balance: {balanceIn} {tokenIn.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
              min="0.000001"
              step="any"
              disabled={loading}
            />
            <select
              value={tokenIn.symbol}
              onChange={(e) => {
                const sym = e.target.value;
                const found = ARC_TESTNET_TOKENS.find(t => t.symbol === sym);
                if (found) {
                  setTokenIn(found);
                  if (tokenOut.symbol === sym) {
                    setTokenOut(ARC_TESTNET_TOKENS.find(t => t.symbol !== sym) || tokenIn);
                  }
                }
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {ARC_TESTNET_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-white text-slate-800">
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-2.5 relative z-10">
          <button
            type="button"
            onClick={handleFlip}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* Token Out Input */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-semibold">
            <span>Receive (Estimated)</span>
            <span>Balance: {balanceOut} {tokenOut.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder={isEstimating ? "Estimating..." : "0.0"}
              value={isEstimating ? "" : amountOut}
              readOnly
              className={`w-full bg-transparent text-2xl font-bold focus:outline-none transition-all duration-300 ${isEstimating ? "text-slate-400 animate-pulse" : "text-slate-700"}`}
            />
            <select
              value={tokenOut.symbol}
              onChange={(e) => {
                const sym = e.target.value;
                const found = ARC_TESTNET_TOKENS.find(t => t.symbol === sym);
                if (found) {
                  setTokenOut(found);
                  if (tokenIn.symbol === sym) {
                    setTokenIn(ARC_TESTNET_TOKENS.find(t => t.symbol !== sym) || tokenOut);
                  }
                }
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {ARC_TESTNET_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-white text-slate-800">
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fee & Network details */}
        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 space-y-1.5 text-xs text-slate-500 font-medium">
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              Estimated Fee <HelpCircle className="h-3 w-3 text-slate-400" />
            </span>
            <span className="font-semibold text-slate-800">~ 0.01 USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span className="text-emerald-600 font-semibold">&lt; 0.05%</span>
          </div>
        </div>

        {/* Submit Swap */}
        {(!mounted || !isConnected) ? (
          <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-medium">
            Please connect wallet to swap
          </div>
        ) : !isCorrectChain ? (
          <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-rose-200 text-rose-500 rounded-2xl bg-rose-50/50 font-medium animate-pulse">
            Please switch chain to Arc Testnet
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !amountIn}
            className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Executing Swap...</span>
              </>
            ) : (
              <span>Swap Tokens</span>
            )}
          </button>
        )}
      </form>

      {/* Error Output */}
      {error && (
        <div className="mt-4 p-4 rounded-2xl border border-rose-200 bg-rose-50/70 text-rose-700 text-xs leading-relaxed space-y-1.5 shadow-sm">
          <div className="font-bold flex items-center gap-1 text-[13px] text-rose-800">Configuration Required</div>
          <p>{error}</p>
        </div>
      )}

      {/* Transaction Status Tracker */}
      {result && result.txHash && (
        <TxStatus txHash={result.txHash} status={txStatus} type="swap" />
      )}
    </div>
  );
}
