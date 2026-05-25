import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { useUsdcBalance } from "@/hooks/useTokenBalance";
import { formatUnits } from "viem";
import { ShieldAlert, RefreshCw } from "lucide-react";

export function WalletConnect() {
  const [mounted, setMounted] = React.useState(false);
  const { isConnected, address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: usdcBalanceRaw } = useUsdcBalance(address);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const SUPPORTED_CHAIN_IDS = [5042002, 11155111, 84532];
  const isSupportedChain = chain?.id ? SUPPORTED_CHAIN_IDS.includes(chain.id) : false;

  const usdcBalance = usdcBalanceRaw 
    ? parseFloat(formatUnits(usdcBalanceRaw, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

  if (!mounted) {
    return (
      <div className="flex justify-center">
        <ConnectButton 
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {isConnected && !isSupportedChain && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="h-4.5 w-4.5" />
          <span>Unsupported Network</span>
        </div>
      )}

      {isConnected && isSupportedChain && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-zinc-400">Gas Balance:</span>
          <span className="font-bold text-zinc-100">{usdcBalance} USDC</span>
        </div>
      )}

      <div className="flex justify-center">
        <ConnectButton 
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </div>
  );
}
