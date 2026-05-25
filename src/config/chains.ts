import { defineChain } from "viem";

export const arcTestnet = {
  ...defineChain({
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"],
        webSocket: ["wss://rpc.testnet.arc.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "ArcScan",
        url: "https://testnet.arcscan.app",
      },
    },
    testnet: true,
  }),
  iconUrl: "https://cdn.prod.website-files.com/685311a976e7c248b5dfde95/68921f69e5659feee825637e_9a3d143150a36125b5d7f0c2367c9ca6_arc-favicon-test.png",
} as any;

// Use Ethereum Sepolia + Base Sepolia for bridge
export { sepolia, baseSepolia } from "viem/chains";
