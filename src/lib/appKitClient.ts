import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http } from "viem";
import { arcTestnet, sepolia, baseSepolia } from "@/config/chains";

// Singleton App Kit instance
export const kit = new AppKit();

// Public clients (read-only, no wallet needed)
export const arcPublicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"),
});

export const ethPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC ?? "https://rpc.sepolia.org"),
});

export const basePublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org"),
});

// Create wallet adapter from connected wallet (use in hooks/components)
// walletClient comes from wagmi's useWalletClient()
export async function createArcAdapter(walletClient: any) {
  return await createViemAdapterFromProvider({
    provider: walletClient.transport,
  });
}

