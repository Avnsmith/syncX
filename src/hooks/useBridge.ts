import { useState } from "react";
import { useWalletClient } from "wagmi";
import { bridgeTokens, type BridgeParams, type BridgeResult } from "@/services/bridgeService";

export function useBridge() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<BridgeResult | null>(null);

  async function bridge(params: Omit<BridgeParams, "walletClient">) {
    if (!walletClient) { 
      setError("Wallet not connected"); 
      return; 
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await bridgeTokens({ ...params, walletClient });
      setResult(res);
      return res;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Bridge failed");
    } finally {
      setLoading(false);
    }
  }

  return { bridge, loading, error, result };
}
