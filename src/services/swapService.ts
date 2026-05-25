import { kit, createArcAdapter } from "@/lib/appKitClient";
import type { TokenSymbol } from "@/config/tokens";

export interface SwapParams {
  tokenIn:     TokenSymbol;
  tokenOut:    TokenSymbol;
  amount:      string; // human-readable, e.g. "1.00"
  walletClient: any;   // from wagmi useWalletClient()
}

export interface SwapResult {
  txHash:    string;
  amountOut: string;
}

export async function swapOnArc(params: SwapParams): Promise<SwapResult> {
  const adapter = await createArcAdapter(params.walletClient);

  const result = await kit.swap({
    from:     { adapter, chain: "Arc_Testnet" },
    tokenIn:  params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amount,
    config: {
      kitKey: process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY || "KIT_KEY:00000000000000000000000000000000:00000000000000000000000000000000",
    },
  });

  return {
    txHash:    result.txHash ?? "",
    amountOut: result.amountOut ?? "0",
  };
}

export interface EstimateSwapParams {
  tokenIn:     TokenSymbol;
  tokenOut:    TokenSymbol;
  amount:      string;
  walletClient: any;
}

export async function estimateSwapOnArc(params: EstimateSwapParams): Promise<string> {
  const adapter = await createArcAdapter(params.walletClient);

  const estimate = await kit.estimateSwap({
    from:     { adapter, chain: "Arc_Testnet" },
    tokenIn:  params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amount,
    config: {
      kitKey: process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY || "KIT_KEY:00000000000000000000000000000000:00000000000000000000000000000000",
    },
  });

  return estimate.estimatedOutput.amount;
}
