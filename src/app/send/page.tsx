"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, erc20Abi, formatUnits } from "viem";
import { USDC_ADDRESSES, EURC_ADDRESSES, useUsdcBalance, useEurcBalance, useCirBtcBalance } from "@/hooks/useTokenBalance";
import { ARC_TESTNET_CONTRACTS } from "@/config/contracts";
import { WalletConnect } from "@/components/WalletConnect";
import { ArrowLeft, Loader2, Send, HelpCircle, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export default function SendPage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address, chain } = useAccount();
  const publicClient = usePublicClient();

  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [estimatedFee, setEstimatedFee] = useState("~ 0.001 USDC");
  const [isEstimating, setIsEstimating] = useState(false);

  // Wagmi transfer hooks
  const { writeContract, data: txHash, error: sendError, isPending: isSubmitting } = useWriteContract();
  const { isLoading: isPendingReceipt, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Get current asset balance
  const activeChainId = chain?.id ?? 5042002;
  const { data: usdcBal, refetch: refetchUsdc } = useUsdcBalance(address);
  const { data: eurcBal, refetch: refetchEur } = useEurcBalance(address);
  const { data: cirBtcBal, refetch: refetchCirBtc } = useCirBtcBalance(address);

  useEffect(() => {
    setMounted(true);
    // Read query parameter for asset selection if present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryAsset = params.get("asset");
      if (queryAsset && ["USDC", "EURC", "cirBTC"].includes(queryAsset)) {
        setAsset(queryAsset);
      }
    }
  }, []);

  // Fetch token decimals
  const getAssetDecimals = (sym: string) => {
    if (sym === "cirBTC") return 8;
    return 6; // USDC & EURC
  };

  const getAssetBalanceRaw = (sym: string) => {
    if (sym === "USDC") return usdcBal;
    if (sym === "EURC") return eurcBal;
    if (sym === "cirBTC") return cirBtcBal;
    return undefined;
  };

  const getAssetBalanceString = (sym: string) => {
    const raw = getAssetBalanceRaw(sym);
    if (raw === undefined) return "0.00";
    const dec = getAssetDecimals(sym);
    return parseFloat(formatUnits(raw, dec)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: sym === "cirBTC" ? 6 : 2,
    });
  };

  // Get token contract address
  const getTokenAddress = (sym: string, chainId: number): `0x${string}` => {
    if (sym === "USDC") return (USDC_ADDRESSES[chainId] ?? ARC_TESTNET_CONTRACTS.USDC) as `0x${string}`;
    if (sym === "EURC") return (EURC_ADDRESSES[chainId] ?? ARC_TESTNET_CONTRACTS.EURC) as `0x${string}`;
    if (sym === "cirBTC") return (ARC_TESTNET_CONTRACTS.CIRBTC) as `0x${string}`;
    return ARC_TESTNET_CONTRACTS.USDC as `0x${string}`;
  };

  // Dynamic fee estimation using public client if connected
  useEffect(() => {
    if (!address || !publicClient || !amount || isNaN(parseFloat(amount)) || !recipient || !recipient.startsWith("0x")) {
      setEstimatedFee("~ 0.001 USDC");
      return;
    }

    const estimateGasFee = async () => {
      setIsEstimating(true);
      try {
        const tokenAddress = getTokenAddress(asset, activeChainId);
        const parsedAmount = parseUnits(amount, getAssetDecimals(asset));
        
        // Estimate gas for ERC20 transfer
        const gasEstimate = await publicClient.estimateContractGas({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient as `0x${string}`, parsedAmount],
          account: address,
        });

        // Get current gas price
        const gasPrice = await publicClient.getGasPrice();
        const feeInGasToken = gasEstimate * gasPrice;

        // Formatted gas fee
        if (activeChainId === 5042002) {
          // On Arc, fee is native USDC (18 decimals for native representation)
          setEstimatedFee(`~ ${parseFloat(formatUnits(feeInGasToken, 18)).toFixed(4)} USDC`);
        } else {
          // On Ethereum or Base Sepolia, fee is native ETH (18 decimals)
          setEstimatedFee(`~ ${parseFloat(formatUnits(feeInGasToken, 18)).toFixed(5)} ETH`);
        }
      } catch (err) {
        console.warn("Failed to estimate gas fee:", err);
        setEstimatedFee("~ 0.0015 USDC");
      } finally {
        setIsEstimating(false);
      }
    };

    const timer = setTimeout(estimateGasFee, 500);
    return () => clearTimeout(timer);
  }, [address, publicClient, asset, amount, recipient, activeChainId]);

  // Persist transaction to Local Storage once confirmed
  useEffect(() => {
    if (isConfirmed && txHash && amount && recipient) {
      try {
        const stored = localStorage.getItem("syncx_local_transactions");
        const list = stored ? JSON.parse(stored) : [];
        
        // Check if already exists to avoid duplicates
        const exists = list.some((t: any) => t.id === txHash);
        if (!exists) {
          const newTx = {
            id: txHash,
            date: new Date().toISOString(),
            amount: parseFloat(amount),
            asset,
            status: "completed",
            type: "send",
            category: "transfer",
            recipient: recipient,
          };
          list.unshift(newTx);
          localStorage.setItem("syncx_local_transactions", JSON.stringify(list));
        }

        // Trigger balance updates
        if (refetchUsdc) refetchUsdc();
        if (refetchEur) refetchEur();
        if (refetchCirBtc) refetchCirBtc();
      } catch (err) {
        console.error("Failed to persist transaction to localStorage:", err);
      }
    }
  }, [isConfirmed, txHash, amount, recipient, asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !recipient || !recipient.startsWith("0x")) {
      alert("Please fill out all fields with valid details.");
      return;
    }

    try {
      const tokenAddress = getTokenAddress(asset, activeChainId);
      const parsedAmount = parseUnits(amount, getAssetDecimals(asset));

      // Call writeContract to send tokens
      writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient as `0x${string}`, parsedAmount],
      });
    } catch (err: any) {
      console.error("Token transfer error:", err);
    }
  };

  const handleReset = () => {
    setAmount("");
    setRecipient("");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen p-6 max-w-xl mx-auto flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading transaction portal...</div>
      </main>
    );
  }

  const activeBalance = getAssetBalanceString(asset);
  const isCorrectNetwork = activeChainId === 5042002 || activeChainId === 11155111 || activeChainId === 84532;

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto bg-slate-50">
      
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 text-sky-600" />
            Send Crypto
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Securely transfer assets instantly on your connected network.
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto text-slate-400">
              <Send className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Please connect your wallet to start transfers</p>
            <WalletConnect />
          </div>
        ) : !isCorrectNetwork ? (
          <div className="bg-rose-50 border border-dashed border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm font-bold text-rose-700">Unsupported Network</p>
            <p className="text-xs text-rose-500">Please connect to a supported network (Arc Testnet, Ethereum Sepolia, Base Sepolia) using your wallet.</p>
            <WalletConnect />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Select Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 p-3 font-semibold text-sm focus:outline-none focus:border-sky-500/50 cursor-pointer"
                disabled={isSubmitting || isPendingReceipt}
              >
                <option value="USDC">USDC (USD Coin)</option>
                <option value="EURC">EURC (Euro Coin)</option>
                {activeChainId === 5042002 && (
                  <option value="cirBTC">cirBTC (Circle Bitcoin)</option>
                )}
              </select>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-500">Amount</label>
                <span className="text-[11px] text-slate-400 font-semibold">Available: {activeBalance} {asset}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 p-3.5 pr-14 font-extrabold text-lg focus:outline-none focus:border-sky-500/50"
                  required
                  min="0.000001"
                  step="any"
                  disabled={isSubmitting || isPendingReceipt}
                />
                <button
                  type="button"
                  onClick={() => {
                    const raw = getAssetBalanceRaw(asset);
                    if (raw !== undefined) {
                      setAmount(formatUnits(raw, getAssetDecimals(asset)));
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 cursor-pointer active:scale-95 transition-all"
                  disabled={isSubmitting || isPendingReceipt}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 p-3.5 font-mono text-sm focus:outline-none focus:border-sky-500/50"
                required
                disabled={isSubmitting || isPendingReceipt}
              />
            </div>

            {/* Fee & Network details */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Estimated Network Fee <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
                </span>
                <span className="font-bold text-slate-800">
                  {isEstimating ? "Estimating..." : estimatedFee}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Network</span>
                <span className="text-slate-700 font-bold uppercase tracking-wider text-[10px] bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">
                  {chain?.name || "Connected"}
                </span>
              </div>
            </div>

            {/* Transfer Actions */}
            {isConfirmed ? (
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold space-y-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm">Transaction Sent Successfully!</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium">Your transfer of {amount} {asset} to {recipient} has been fully confirmed on-chain.</p>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                  {txHash && (
                    <a
                      href={activeChainId === 5042002 ? `https://testnet.arcscan.app/tx/${txHash}` : `https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-800 hover:underline"
                    >
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-1 px-3 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 font-bold transition-all shadow-sm cursor-pointer"
                  >
                    New Transfer
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isPendingReceipt || !amount || !recipient}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing Transaction...</span>
                  </>
                ) : isPendingReceipt ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Pending Blockchain Confirmation...</span>
                  </>
                ) : (
                  <span>Send Transaction</span>
                )}
              </button>
            )}

            {/* Error Messages */}
            {(sendError || receiptError) && (
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs leading-relaxed space-y-1 shadow-sm">
                <div className="font-bold flex items-center gap-1 text-[13px] text-rose-800">
                  <XCircle className="h-4.5 w-4.5 text-rose-600" />
                  Transaction Failed
                </div>
                <p className="font-medium">{(sendError || receiptError)?.message || "The contract call was rejected or ran out of gas."}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
