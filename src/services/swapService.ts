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

function getValidatedKitKey(): string {
  const kitKey = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY;
  if (!kitKey || kitKey === "YOUR_CIRCLE_KIT_KEY_HERE" || kitKey.includes("00000000000000000000000000000000")) {
    throw new Error("Circle Web3 AppKit is unconfigured. A valid Kit Key is required to execute real swaps. Please register at console.circle.com, generate a Kit Key, and set NEXT_PUBLIC_CIRCLE_KIT_KEY in your .env or .env.local file.");
  }
  return kitKey;
}

export async function swapOnArc(params: SwapParams): Promise<SwapResult> {
  const kitKey = getValidatedKitKey();
  const adapter = await createArcAdapter(params.walletClient);

  const result = await kit.swap({
    from:     { adapter, chain: "Arc_Testnet" },
    tokenIn:  params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amount,
    config: {
      kitKey,
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
  const kitKey = getValidatedKitKey();
  const adapter = await createArcAdapter(params.walletClient);

  const estimate = await kit.estimateSwap({
    from:     { adapter, chain: "Arc_Testnet" },
    tokenIn:  params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amount,
    config: {
      kitKey,
    },
  });

  return estimate.estimatedOutput.amount;
}
