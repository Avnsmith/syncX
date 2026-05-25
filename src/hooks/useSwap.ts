import { useState } from "react";
import { useWalletClient } from "wagmi";
import { swapOnArc, type SwapParams, type SwapResult } from "@/services/swapService";

export function useSwap() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<SwapResult | null>(null);

  async function swap(params: Omit<SwapParams, "walletClient">) {
    if (!walletClient) { 
      setError("Wallet not connected"); 
      return; 
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await swapOnArc({ ...params, walletClient });
      setResult(res);
      return res;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Swap failed");
    } finally {
      setLoading(false);
    }
  }

  return { swap, loading, error, result };
}
