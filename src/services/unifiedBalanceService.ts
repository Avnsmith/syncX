import { kit, createArcAdapter } from "@/lib/appKitClient";
import type { SupportedChain } from "./bridgeService";

export async function depositToUnifiedBalance(params: {
  fromChain:    SupportedChain;
  amount:       string;
  walletClient: any;
}) {
  const adapter = await createArcAdapter(params.walletClient);
  return kit.unifiedBalance.deposit({
    from:   { adapter, chain: params.fromChain },
    amount: params.amount,
    token:  "USDC",
  });
}

export async function spendFromUnifiedBalance(params: {
  amount:       string;
  recipientAddress: string;
  toChain:      SupportedChain;
  walletClient: any;
}) {
  const adapter = await createArcAdapter(params.walletClient);
  return kit.unifiedBalance.spend({
    amount: params.amount,
    from:   { adapter },
    to: {
      adapter,
      chain:            params.toChain,
      recipientAddress: params.recipientAddress,
    },
  });
}

export async function estimateUnifiedSpend(amount: string, toChain: SupportedChain, walletClient: any) {
  const adapter = await createArcAdapter(walletClient);
  return kit.unifiedBalance.estimateSpend({
    from: { adapter },
    to: { adapter, chain: toChain },
    token: "USDC",
    amount,
  });
}

export async function getUnifiedBalance(address: string): Promise<string> {
  try {
    const res = await kit.unifiedBalance.getBalances({
      sources: {
        address,
        chains: ["Arc_Testnet", "Ethereum_Sepolia", "Base_Sepolia"],
      },
    });
    return res?.totalConfirmedBalance ?? "0.00";
  } catch (err) {
    console.error("Error fetching unified balance:", err);
    return "0.00";
  }
}

