# Arc Starter Kit — Build Instructions for Claude Code

> Feed file này vào Claude Code / Cursor / Windsurf cùng với `SKILL.md`.
> Agent sẽ đọc và tự biết cần làm gì để build bộ starter kit hoàn chỉnh.

---

## Mục tiêu dự án

Build một **Next.js boilerplate** (Arc Starter Kit) cho phép developers clone về
và có ngay đầy đủ scaffold để phát triển dApp trên Arc Network với:

- **Swap** — đổi USDC ↔ EURC ↔ cirBTC trên Arc Testnet
- **Bridge** — bridge USDC/EURC giữa Arc Testnet ↔ Ethereum Sepolia ↔ Base Sepolia qua CCTP

Mục tiêu là **boilerplate sạch nhất có thể** — người clone về chỉ cần đặt
env vars, chạy `npm install && npm run dev` là thấy UI, sửa tiếp business logic
của mình vào là xong.

---

## Tech Stack

| Layer | Choice | Lý do |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | File-based routing, RSC, dễ deploy |
| Language | TypeScript (strict) | Type safety quan trọng với on-chain data |
| Styling | Tailwind CSS v3 + shadcn/ui | Copy-paste components, dark mode sẵn |
| Web3 | Wagmi v2 + Viem v2 | Standard cho EVM dApps |
| Circle SDK | `@circle-fin/app-kit` + `@circle-fin/adapter-viem-v2` | Core bridge/swap engine |
| State | Zustand | Nhẹ, đủ cho app này |
| Wallet | RainbowKit hoặc ConnectKit | Wallet modal đẹp, wagmi-native |

---

## Bước 1 — Scaffold Project

```bash
npx create-next-app@latest arc-starter-kit \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd arc-starter-kit

# Circle SDK
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2

# Web3
npm install wagmi viem @tanstack/react-query

# Wallet UI (chọn 1)
npm install @rainbow-me/rainbowkit
# hoặc
npm install connectkit

# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select tabs badge

# State
npm install zustand

# Dev utils
npm install -D @types/node
```

---

## Bước 2 — Tạo Chain Config

### `src/config/chains.ts`

```ts
import { defineChain } from "viem";

export const arcTestnet = defineChain({
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
});

// Dùng Ethereum Sepolia + Base Sepolia cho bridge
export { sepolia, baseSepolia } from "viem/chains";
```

### `src/config/contracts.ts`

```ts
// Arc Testnet contract addresses
// QUAN TRỌNG: Đây là TESTNET addresses. Mainnet sẽ khác.

export const ARC_TESTNET_CONTRACTS = {
  // Stablecoins
  USDC:  "0x3600000000000000000000000000000000000000",
  EURC:  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC:  "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
  CIRBTC: "", // Placeholder — update khi Circle publish

  // CCTP (Domain 26)
  TokenMessengerV2:     "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
  MessageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  TokenMinterV2:        "0xb43db544E2c27092c107639Ad201b3dEfAbcF192",
  MessageV2:            "0xbaC0179bB358A8936169a63408C8481D582390C4",

  // Gateway
  GatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
  GatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",

  // Common
  Multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  Permit2:    "0x000000000022D473030F116dDEE9F6B43aC78BA3",
} as const;

export const CCTP_DOMAINS = {
  ARC_TESTNET:      26,
  ETHEREUM_SEPOLIA: 0,
  BASE_SEPOLIA:     6,
} as const;
```

### `src/config/tokens.ts`

```ts
export type TokenSymbol = "USDC" | "EURC" | "USYC" | "cirBTC";

export interface TokenConfig {
  symbol:   TokenSymbol;
  name:     string;
  decimals: number;
  address:  string;
  logoUrl:  string;
  coingeckoId?: string;
}

export const ARC_TESTNET_TOKENS: TokenConfig[] = [
  {
    symbol:   "USDC",
    name:     "USD Coin",
    decimals: 6,
    address:  "0x3600000000000000000000000000000000000000",
    logoUrl:  "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
    coingeckoId: "usd-coin",
  },
  {
    symbol:   "EURC",
    name:     "Euro Coin",
    decimals: 6,
    address:  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    logoUrl:  "https://cryptologos.cc/logos/euro-coin-eurc-logo.svg",
    coingeckoId: "euro-coin",
  },
  {
    symbol:   "cirBTC",
    name:     "Circle Bitcoin",
    decimals: 8,
    address:  "", // TBD — add when Circle publishes
    logoUrl:  "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
  },
];

export const BRIDGE_CHAINS = [
  {
    id:      5042002,
    name:    "Arc Testnet",
    appKitId: "Arc_Testnet",
    logoUrl: "/chains/arc.svg",
  },
  {
    id:      11155111,
    name:    "Ethereum Sepolia",
    appKitId: "Ethereum_Sepolia",
    logoUrl: "/chains/eth.svg",
  },
  {
    id:      84532,
    name:    "Base Sepolia",
    appKitId: "Base_Sepolia",
    logoUrl: "/chains/base.svg",
  },
] as const;
```

---

## Bước 3 — App Kit Client

### `src/lib/appKitClient.ts`

```ts
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromWalletClient } from "@circle-fin/adapter-viem-v2";
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
export function createArcAdapter(walletClient: any) {
  return createViemAdapterFromWalletClient({ walletClient });
}
```

### `src/lib/wagmiConfig.ts`

```ts
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
    appName: "Arc Starter Kit",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  }
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet, sepolia, baseSepolia],
  connectors,
  transports: {
    [arcTestnet.id]:   http(process.env.NEXT_PUBLIC_ARC_RPC_URL),
    [sepolia.id]:      http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC),
    [baseSepolia.id]:  http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
  },
});
```

---

## Bước 4 — Services

### `src/services/swapService.ts`

```ts
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
  const adapter = createArcAdapter(params.walletClient);

  const result = await kit.swap({
    adapter,
    chain:    "Arc_Testnet",
    tokenIn:  params.tokenIn,
    tokenOut: params.tokenOut,
    amount:   params.amount,
    kitKey:   process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY!,
  });

  return {
    txHash:    result.transactionHash ?? "",
    amountOut: result.amountOut ?? "0",
  };
}
```

### `src/services/bridgeService.ts`

```ts
import { kit, createArcAdapter } from "@/lib/appKitClient";

export type SupportedChain = "Arc_Testnet" | "Ethereum_Sepolia" | "Base_Sepolia";

export interface BridgeParams {
  fromChain:    SupportedChain;
  toChain:      SupportedChain;
  token:        "USDC" | "EURC";
  amount:       string;
  walletClient: any;
}

export interface BridgeResult {
  sourceTxHash: string;
  destTxHash?:  string;
  status:       "pending" | "attesting" | "minting" | "complete" | "failed";
}

export async function bridgeTokens(params: BridgeParams): Promise<BridgeResult> {
  const adapter = createArcAdapter(params.walletClient);

  // App Kit handles: approve → burn → wait attestation → mint
  const result = await kit.bridge({
    from: { adapter, chain: params.fromChain },
    to:   { adapter, chain: params.toChain },
    amount: params.amount,
    // token is USDC by default; pass token param if SDK supports it
  });

  return {
    sourceTxHash: result.sourceTxHash ?? "",
    destTxHash:   result.destinationTxHash,
    status:       "complete",
  };
}

// Estimate bridge fee before sending
export async function estimateBridgeFee(params: Omit<BridgeParams, "walletClient">) {
  // Implement using kit.estimateBridge() if available
  // Otherwise fetch gas from arcPublicClient and ethPublicClient separately
  // Return combined fee in USDC
}
```

### `src/services/unifiedBalanceService.ts`

```ts
import { kit, createArcAdapter } from "@/lib/appKitClient";
import type { SupportedChain } from "./bridgeService";

// Optional — only needed if building Gateway/Unified Balance feature

export async function depositToUnifiedBalance(params: {
  fromChain:    SupportedChain;
  amount:       string;
  walletClient: any;
}) {
  const adapter = createArcAdapter(params.walletClient);
  return kit.unifiedBalance.deposit({
    from:   { adapter, chain: params.fromChain },
    amount: params.amount,
    token:  "USDC",
  });
}

export async function spendFromUnifiedBalance(params: {
  amount:       string;
  recipientAddress: string;
  walletClient: any;
}) {
  const adapter = createArcAdapter(params.walletClient);
  return kit.unifiedBalance.spend({
    amount: params.amount,
    from:   { adapter },
    to: {
      adapter,
      chain:            "Arc_Testnet",
      recipientAddress: params.recipientAddress,
    },
  });
}

export async function estimateUnifiedSpend(amount: string, walletClient: any) {
  const adapter = createArcAdapter(walletClient);
  return kit.unifiedBalance.estimateSpend({ amount, adapter });
}
```

---

## Bước 5 — React Hooks

### `src/hooks/useSwap.ts`

```ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { swapOnArc, type SwapParams, type SwapResult } from "@/services/swapService";

export function useSwap() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<SwapResult | null>(null);

  async function swap(params: Omit<SwapParams, "walletClient">) {
    if (!walletClient) { setError("Wallet not connected"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await swapOnArc({ ...params, walletClient });
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Swap failed");
    } finally {
      setLoading(false);
    }
  }

  return { swap, loading, error, result };
}
```

### `src/hooks/useBridge.ts`

```ts
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { bridgeTokens, type BridgeParams, type BridgeResult } from "@/services/bridgeService";

export function useBridge() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<BridgeResult | null>(null);

  async function bridge(params: Omit<BridgeParams, "walletClient">) {
    if (!walletClient) { setError("Wallet not connected"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await bridgeTokens({ ...params, walletClient });
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Bridge failed");
    } finally {
      setLoading(false);
    }
  }

  return { bridge, loading, error, result };
}
```

### `src/hooks/useTokenBalance.ts`

```ts
import { useBalance, useReadContract } from "wagmi";
import { ARC_TESTNET_CONTRACTS } from "@/config/contracts";
import { erc20Abi } from "viem";

export function useUsdcBalance(address?: `0x${string}`) {
  return useReadContract({
    address: ARC_TESTNET_CONTRACTS.USDC as `0x${string}`,
    abi:     erc20Abi,
    functionName: "balanceOf",
    args:    address ? [address] : undefined,
    query:   { enabled: !!address },
  });
}

export function useEurcBalance(address?: `0x${string}`) {
  return useReadContract({
    address: ARC_TESTNET_CONTRACTS.EURC as `0x${string}`,
    abi:     erc20Abi,
    functionName: "balanceOf",
    args:    address ? [address] : undefined,
    query:   { enabled: !!address },
  });
}
```

---

## Bước 6 — UI Components (Scaffold)

Agent cần tạo các component sau. Dùng shadcn/ui + Tailwind.
Design: **dark theme**, clean, DeFi-style.

### `src/components/SwapWidget.tsx`

State cần quản lý:
- `tokenIn`, `tokenOut` (select từ `ARC_TESTNET_TOKENS`)
- `amountIn` (input)
- `amountOut` (estimated — placeholder hoặc fetch từ kit)
- Nút "Swap tokens" (đảo tokenIn ↔ tokenOut)
- Nút "Swap" → gọi `useSwap().swap()`
- Hiển thị fee ước tính bằng USDC
- Hiển thị `TxStatus` sau khi submit

### `src/components/BridgeWidget.tsx`

State cần quản lý:
- `fromChain`, `toChain` (select từ `BRIDGE_CHAINS`)
- `token` (USDC hoặc EURC)
- `amount`
- `recipientAddress` (default = connected wallet, có thể override)
- `speedMode`: Fast (8–20s) hoặc Standard (15–19 min)
- Fee estimate hiển thị bằng USDC
- Nút "Bridge" → gọi `useBridge().bridge()`
- Hiển thị `TxStatus` với step tracker

### `src/components/TxStatus.tsx`

Props: `txHash`, `status`, `explorerUrl`

Hiển thị:
- Spinner khi pending
- Steps: Submitted → Attesting → Minting → Complete (dành cho bridge)
- Link đến `https://testnet.arcscan.app/tx/{txHash}`

### `src/components/WalletConnect.tsx`

- Dùng RainbowKit `<ConnectButton />` hoặc ConnectKit `<ConnectKitButton />`
- Hiển thị USDC balance khi connected
- Hiển thị chain hiện tại + nút switch chain

---

## Bước 7 — Pages & Layout

### `src/app/layout.tsx`

```tsx
// Wrap với: WagmiProvider, QueryClientProvider, RainbowKitProvider
// Dark mode mặc định
// Font: Geist hoặc Inter
```

### `src/app/page.tsx`

```tsx
// Trang chính: Tabs "Swap" | "Bridge"
// Hiển thị WalletConnect ở góc trên phải
// Khi chọn tab → render SwapWidget hoặc BridgeWidget
```

---

## Bước 8 — .env.example

Tạo file này, commit vào repo (không có giá trị thật):

```bash
# Arc Network
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_EXPLORER=https://testnet.arcscan.app

# Circle App Kit (lấy từ https://console.circle.com)
NEXT_PUBLIC_CIRCLE_KIT_KEY=your_circle_kit_key_here

# WalletConnect (lấy từ https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Other Chains (Testnet RPCs)
NEXT_PUBLIC_ETH_SEPOLIA_RPC=https://rpc.sepolia.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Token Addresses — Arc Testnet
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_EURC_ADDRESS=0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
NEXT_PUBLIC_CIRBTC_ADDRESS=TBD
```

---

## Bước 9 — README.md

Viết README ngắn gọn với:

1. **Intro** — "Arc Starter Kit: Swap + Bridge boilerplate cho Arc Network"
2. **Prerequisites** — Node 18+, git, Circle Console account, faucet USDC
3. **Clone & Setup**
   ```bash
   git clone https://github.com/your-org/arc-starter-kit
   cd arc-starter-kit
   npm install
   cp .env.example .env.local
   # Điền các giá trị trong .env.local
   npm run dev
   ```
4. **Lấy API keys** — link Circle Console, WalletConnect Cloud, Circle Faucet
5. **Testnet tokens** — hướng dẫn claim USDC/EURC từ https://faucet.circle.com
6. **Project structure** — mô tả ngắn từng folder
7. **Extending** — gợi ý những gì có thể build thêm (mainnet config, Gateway, analytics, custom fees)
8. **Resources** — link docs Arc, App Kit, CCTP, Circle

---

## Checklist Hoàn Chỉnh

Agent phải tạo đủ các files sau trước khi báo done:

### Config & Lib
- [ ] `src/config/chains.ts`
- [ ] `src/config/contracts.ts`
- [ ] `src/config/tokens.ts`
- [ ] `src/lib/appKitClient.ts`
- [ ] `src/lib/wagmiConfig.ts`

### Services
- [ ] `src/services/swapService.ts`
- [ ] `src/services/bridgeService.ts`
- [ ] `src/services/unifiedBalanceService.ts`

### Hooks
- [ ] `src/hooks/useSwap.ts`
- [ ] `src/hooks/useBridge.ts`
- [ ] `src/hooks/useTokenBalance.ts`

### Components
- [ ] `src/components/SwapWidget.tsx`
- [ ] `src/components/BridgeWidget.tsx`
- [ ] `src/components/TxStatus.tsx`
- [ ] `src/components/WalletConnect.tsx`

### Pages
- [ ] `src/app/layout.tsx`
- [ ] `src/app/page.tsx`

### Root files
- [ ] `.env.example`
- [ ] `README.md`
- [ ] `docs/SKILL.md`

---

## Lưu ý cuối

- **Không viết logic trên mainnet** — toàn bộ addresses và RPCs là testnet.
- **cirBTC** — để `address: ""` trong config, comment `// TODO: update when Circle publishes`.
- **Không commit private key hoặc Kit Key** — chỉ commit `.env.example`.
- **Display gas fee bằng USDC** — không bao giờ hiển thị Gwei cho end user.
- **Arc không có reorg** — không cần `waitForConfirmations > 1`.
- **Kiểm tra Chain ID** — khi user connect wallet, validate `chainId === 5042002` trước khi gọi bất kỳ Arc-specific function nào.
