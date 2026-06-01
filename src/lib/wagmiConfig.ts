import { createConfig, http } from "wagmi";
import { arcTestnet, sepolia, baseSepolia } from "@/config/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet, coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
  {
    appName: "SyncX",
    projectId: "e596700f135b91b975e5330a108b98eb", // Fallback dummy key to bypass WalletConnect ID requirements for standard injected wallets
  }
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet, sepolia, baseSepolia],
  connectors,
  transports: {
    [arcTestnet.id]:   http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"),
    [sepolia.id]:      http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC ?? "https://rpc.sepolia.org"),
    [baseSepolia.id]:  http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org"),
  },
});
