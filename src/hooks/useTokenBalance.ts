import { useAccount, useReadContract } from "wagmi";
import { ARC_TESTNET_CONTRACTS } from "@/config/contracts";
import { erc20Abi } from "viem";

// Official USDC addresses on supported testnets
export const USDC_ADDRESSES: Record<number, string> = {
  5042002: ARC_TESTNET_CONTRACTS.USDC, // Arc Testnet
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
  84532: "0x036eD435974355090726c85e80a2290f898a34d8", // Base Sepolia
};

// Official EURC addresses on supported testnets
export const EURC_ADDRESSES: Record<number, string> = {
  5042002: ARC_TESTNET_CONTRACTS.EURC, // Arc Testnet
  11155111: "0x082855428101c2aA7bE2E426FCDD70f2fA752a5B", // Ethereum Sepolia
  84532: "0x8084aB127C72e19747948231c55B9075ce65452d", // Base Sepolia
};

export function useUsdcBalance(address?: `0x${string}`, chainId?: number) {
  const { chain } = useAccount();
  const activeChainId = chainId ?? chain?.id ?? 5042002;
  const tokenAddress = USDC_ADDRESSES[activeChainId] ?? ARC_TESTNET_CONTRACTS.USDC;

  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi:     erc20Abi,
    functionName: "balanceOf",
    args:    address ? [address] : undefined,
    query:   { 
      enabled: !!address,
    },
    chainId: activeChainId,
  });
}

export function useEurcBalance(address?: `0x${string}`, chainId?: number) {
  const { chain } = useAccount();
  const activeChainId = chainId ?? chain?.id ?? 5042002;
  const tokenAddress = EURC_ADDRESSES[activeChainId] ?? ARC_TESTNET_CONTRACTS.EURC;

  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi:     erc20Abi,
    functionName: "balanceOf",
    args:    address ? [address] : undefined,
    query:   { 
      enabled: !!address,
    },
    chainId: activeChainId,
  });
}

export function useCirBtcBalance(address?: `0x${string}`, chainId?: number) {
  const { chain } = useAccount();
  const activeChainId = chainId ?? chain?.id ?? 5042002;

  return useReadContract({
    address: ARC_TESTNET_CONTRACTS.CIRBTC as `0x${string}`,
    abi:     erc20Abi,
    functionName: "balanceOf",
    args:    address ? [address] : undefined,
    query:   { 
      enabled: !!address && !!ARC_TESTNET_CONTRACTS.CIRBTC && activeChainId === 5042002,
    },
    chainId: activeChainId,
  });
}

