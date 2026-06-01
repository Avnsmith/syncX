import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { depositToUnifiedBalance, spendFromUnifiedBalance, estimateUnifiedSpend, getUnifiedBalance } from "@/services/unifiedBalanceService";
import { BRIDGE_CHAINS } from "@/config/tokens";
import { useUsdcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { Loader2, ArrowRightLeft, HelpCircle } from "lucide-react";

export function GatewayWidget() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [activeTab, setActiveTab] = useState<"deposit" | "spend">("deposit");
  const [depositChain, setDepositChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[2]); // Base Sepolia
  const [spendChain, setSpendChain] = useState<(typeof BRIDGE_CHAINS)[number]>(BRIDGE_CHAINS[0]); // Arc Testnet
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unifiedBalance, setUnifiedBalance] = useState<string>("0.00");
  const [successTx, setSuccessTx] = useState<{ hash: string; url?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getExplorerUrl = (chainId: number, hash: string) => {
    if (chainId === 5042002) return `https://testnet.arcscan.app/tx/${hash}`;
    if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
    if (chainId === 84532) return `https://sepolia.basescan.org/tx/${hash}`;
    return "";
  };

  const fetchUnifiedBalance = async () => {
    if (!address) return;
    try {
      const bal = await getUnifiedBalance(address);
      setUnifiedBalance(parseFloat(bal).toFixed(2));
    } catch (e) {
      console.error("Failed to fetch unified balance", e);
    }
  };

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchUnifiedBalance();
    }
  }, [mounted, isConnected, address]);

  useEffect(() => {
    if (activeTab === "spend" && isConnected && address) {
      fetchUnifiedBalance();
    }
  }, [activeTab, isConnected, address]);

  const { data: usdcBal, refetch: refetchUsdc } = useUsdcBalance(address, depositChain.id);
  const balanceText = (mounted && isConnected) ? parseFloat(formatUnits(usdcBal || 0n, 6)).toFixed(2) : "0.00";

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !walletClient) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSuccessTx(null);
    try {
      const res = await depositToUnifiedBalance({
        fromChain: depositChain.appKitId as any,
        amount,
        walletClient,
      });
      
      const depositRes = res as any;
      const hash = depositRes?.transactionHash || depositRes?.txHash || depositRes?.hash || (typeof depositRes === "string" && depositRes.startsWith("0x") ? depositRes : "");
      if (hash) {
        const url = getExplorerUrl(depositChain.id, hash);
        setSuccessTx({ hash, url });
      }

      setSuccessMsg(`Successfully deposited ${amount} USDC into Unified Balance.`);
      setAmount("");
      // Refresh balances
      fetchUnifiedBalance();
      if (refetchUsdc) refetchUsdc();
    } catch (err: any) {
      setError(err?.message ?? "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || !recipient || !walletClient) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSuccessTx(null);
    try {
      const res = await spendFromUnifiedBalance({
        amount,
        recipientAddress: recipient,
        toChain: spendChain.appKitId as any,
        walletClient,
      });

      const spendRes = res as any;
      const hash = spendRes?.txHash || spendRes?.transactionHash || spendRes?.hash || (typeof spendRes === "string" && spendRes.startsWith("0x") ? spendRes : "");
      const url = spendRes?.explorerUrl || (hash ? getExplorerUrl(spendChain.id, hash) : "");
      if (hash) {
        setSuccessTx({ hash, url });
      }

      setSuccessMsg(`Successfully spent ${amount} USDC to recipient on ${spendChain.name}.`);
      setAmount("");
      setRecipient("");
      // Refresh balances
      fetchUnifiedBalance();
      if (refetchUsdc) refetchUsdc();
    } catch (err: any) {
      setError(err?.message ?? "Spend transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Unified Balance</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Gateway
          </span>
        </h2>
      </div>

      <div className="flex gap-2 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/40 mb-6">
        <button
          onClick={() => { setActiveTab("deposit"); setError(null); setSuccessMsg(null); setSuccessTx(null); }}
          className={`w-1/2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "deposit"
              ? "bg-white text-slate-900 border border-slate-200/60 shadow-md"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Deposit USDC
        </button>
        <button
          onClick={() => { setActiveTab("spend"); setError(null); setSuccessMsg(null); setSuccessTx(null); }}
          className={`w-1/2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "spend"
              ? "bg-white text-slate-900 border border-slate-200/60 shadow-md"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Instant Spend
        </button>
      </div>

      {activeTab === "deposit" ? (
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Source Network</span>
            <select
              value={depositChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) setDepositChain(found);
              }}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {BRIDGE_CHAINS.filter(c => c.appKitId !== "Arc_Testnet").map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-semibold">
              <span>Amount to Deposit</span>
              <span>Balance: {balanceText} USDC</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none [appearance:textfield]"
                required
                min="0.01"
                step="any"
                disabled={loading}
              />
              <span className="text-sm font-semibold text-slate-400">USDC</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Depositing funds locks USDC into the Gateway account, allowing sub-second payments and instant cross-chain liquidity.
            </span>
          </div>

          {(!mounted || !isConnected) ? (
            <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-medium">
              Please connect wallet to deposit
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full py-4 px-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-550 text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Depositing...</span>
                </>
              ) : (
                <span>Deposit into Gateway</span>
              )}
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={handleSpend} className="space-y-4">
          {/* Destination Chain Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Destination Network</span>
            <select
              value={spendChain.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = BRIDGE_CHAINS.find(c => c.id === id);
                if (found) setSpendChain(found);
              }}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {BRIDGE_CHAINS.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-semibold">
              <span>Amount to Spend</span>
              <span>Unified Balance: {unifiedBalance} USDC</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none [appearance:textfield]"
                required
                min="0.01"
                step="any"
                disabled={loading}
              />
              <span className="text-sm font-semibold text-slate-400">USDC</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 focus-within:border-indigo-500/50 transition-all">
            <label className="text-[10px] uppercase font-bold text-slate-500">Recipient Address ({spendChain.name})</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-850 placeholder-slate-300 focus:outline-none font-mono"
              required
              disabled={loading}
            />
          </div>

          <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium flex items-start gap-2">
            <ArrowRightLeft className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Spending USDC transfers directly from the Unified Balance to the recipient on {spendChain.name} in &lt;500ms.
            </span>
          </div>

          {(!mounted || !isConnected) ? (
            <div className="w-full text-center text-sm py-3 px-4 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-medium">
              Please connect wallet to spend
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || !amount || !recipient}
              className="w-full py-4 px-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-550 text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Spend...</span>
                </>
              ) : (
                <span>Spend USDC Instantly</span>
              )}
            </button>
          )}
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3.5 rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-700 text-xs text-center font-medium space-y-2">
          <div>{successMsg}</div>
          {successTx && (
            <div className="pt-2 border-t border-emerald-200/60 flex flex-col items-center gap-1.5 text-[10px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Transaction Hash</span>
              <a
                href={successTx.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sky-600 hover:underline transition-all break-all select-all block px-2 py-1 rounded bg-slate-100 max-w-full truncate"
              >
                {successTx.hash}
              </a>
              {successTx.url && (
                <span className="text-[9px] text-slate-400 italic mt-0.5">Click to view on Explorer ↗</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
