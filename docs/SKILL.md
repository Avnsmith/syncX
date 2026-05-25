---
name: arc-starter-kit
description: >
  Use this skill whenever building a dApp on Arc Network using Circle's App Kit.
  Covers swap tokens on Arc, bridge USDC/EURC via CCTP between Arc/Ethereum/Base,
  unified balance with Gateway, chain config, contract addresses, gas model,
  and recommended project structure for a starter kit boilerplate.
---

# Arc Starter Kit – Skill Context

This skill provides all technical context needed to build a production-ready
**Swap + Bridge dApp** on Arc Network using Circle's App Kit SDK.

---

## 1. Arc Network – Core Facts

- Arc is an EVM-compatible chain where **USDC is the native gas token** (not ETH).
- Execution layer: **Reth** (Rust Ethereum client) + Arc-specific precompiles.
- Consensus layer: **Malachite BFT PoA** — finality ~350ms, 3000+ TPS, no reorgs.
- Because there are no reorgs, treat tx as final after 1 block — no need for deep confirmation logic.

### Arc Testnet Parameters

| Parameter       | Value                                    |
|----------------|------------------------------------------|
| Chain ID        | `5042002`                                |
| RPC (primary)   | `https://rpc.testnet.arc.network`        |
| WSS             | `wss://rpc.testnet.arc.network`          |
| Block explorer  | `https://testnet.arcscan.app`            |
| Gas tracker     | `https://testnet.arcscan.app/gas-tracker`|
| Faucet          | `https://faucet.circle.com`              |
| Native currency | USDC                                     |

### Alternate RPC Providers (Testnet)

| Provider    | HTTP                                              |
|-------------|---------------------------------------------------|
| Blockdaemon | `https://rpc.blockdaemon.testnet.arc.network`     |
| dRPC        | `https://rpc.drpc.testnet.arc.network`            |
| QuickNode   | `https://rpc.quicknode.testnet.arc.network`       |

---

## 2. Gas & Fees on Arc

- Gas is paid in **USDC** — target base fee ≈ **0.01 USD/tx**.
- Fee model: **EIP-1559 + EWMA smoothing** for stable pricing.
- Internal gas accounting uses 18 decimals; USDC ERC-20 interface uses 6 decimals — same underlying balance.

### Required TX Parameters

```ts
maxFeePerGas: >= 20n * 10n**9n  // 20 Gwei minimum — NEVER go below this
maxPriorityFeePerGas: 1n * 10n**9n  // 1 Gwei tip (0 accepted but tip helps inclusion)
```

### Common Gas Errors

| Error | Fix |
|-------|-----|
| `transaction underpriced` | Raise `maxFeePerGas` above 20 Gwei |
| `intrinsic gas too low` | Set gas limit >= 21000 |
| `insufficient funds for gas * price + value` | Add USDC from faucet |

**UX rule:** Always display fees to users in **USDC (USD)** — never in Gwei.

---

## 3. Contract Addresses — Arc Testnet

> These addresses are Arc TESTNET only. Mainnet addresses will differ.

### Stablecoins

| Token | Address | Decimals |
|-------|---------|---------|
| USDC  | `0x3600000000000000000000000000000000000000` | 6 |
| EURC  | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 |
| USYC  | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | 6 |
| cirBTC | TBD — placeholder in config | 8 |

USDC = native gas token AND ERC-20. Both share the same underlying balance.
Claim testnet tokens from: https://faucet.circle.com (select Arc Testnet).

### CCTP Contracts — Arc Testnet (Domain 26)

| Contract             | Address |
|----------------------|---------|
| TokenMessengerV2     | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| MessageTransmitterV2 | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |
| TokenMinterV2        | `0xb43db544E2c27092c107639Ad201b3dEfAbcF192` |
| MessageV2            | `0xbaC0179bB358A8936169a63408C8481D582390C4` |

### Gateway Contracts — Arc Testnet (Domain 26)

| Contract       | Address |
|----------------|---------|
| GatewayWallet  | `0x0077777d7EBA4688BDeF3E311b846F25870A19B9` |
| GatewayMinter  | `0x0022222ABE238Cc2C7Bb1f21003F0a260052475B` |

### Common Ethereum Contracts (also on Arc)

| Contract                  | Address |
|---------------------------|---------|
| CREATE2 Factory (Arachnid)| `0x4e59b44847b379578588920cA78FbF26c0B4956C` |
| Multicall3                | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Permit2                   | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |

---

## 4. Circle App Kit — SDK Overview

App Kit is Circle's multichain SDK. It abstracts Bridge (CCTP), Swap (AMM),
Send (transfer), and Unified Balance (Gateway) behind one interface.

### Install

```bash
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem
```

### Initialize — Arc Testnet with Viem

```ts
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http } from "viem";

const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
};

// For server-side / scripts (private key)
export const arcAdapter = createViemAdapterFromPrivateKey({
  privateKey: process.env.PRIVATE_KEY!,
  chain: "Arc_Testnet",
});

// For browser (wallet connect) — use createViemAdapterFromWalletClient instead

export const kit = new AppKit();
```

---

## 5. Swap — Same-Chain on Arc

Swap exchanges tokens on the same blockchain via App Kit's swap capability.
Supported pairs on Arc: USDC ↔ EURC, and cirBTC once supported.

```ts
export async function swapOnArc(params: {
  tokenIn: "USDC" | "EURC" | "cirBTC";
  tokenOut: "USDC" | "EURC" | "cirBTC";
  amount: string; // human-readable, e.g. "1.00"
}) {
  return await kit.swap({
    adapter: arcAdapter,
    chain: "Arc_Testnet",
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    amount: params.amount,
    kitKey: process.env.CIRCLE_KIT_KEY!,
  });
}
```

---

## 6. Bridge — Cross-Chain via CCTP

Bridge burns USDC on source chain, Circle attests, then mints native USDC
on destination chain. No wrapped tokens. No liquidity pools.

### Transfer Speeds

| Mode     | Speed      | Cost  |
|----------|-----------|-------|
| Fast     | 8–20 sec  | Higher|
| Standard | 15–19 min | Lower |

### Bridge Examples

```ts
// Ethereum Sepolia → Arc Testnet
const result = await kit.bridge({
  from: { adapter: ethAdapter, chain: "Ethereum_Sepolia" },
  to:   { adapter: arcAdapter, chain: "Arc_Testnet" },
  amount: "10.00",
});

// Base Sepolia → Arc Testnet
const result = await kit.bridge({
  from: { adapter: baseAdapter, chain: "Base_Sepolia" },
  to:   { adapter: arcAdapter, chain: "Arc_Testnet" },
  amount: "5.00",
});

// Arc Testnet → Ethereum Sepolia (reverse)
const result = await kit.bridge({
  from: { adapter: arcAdapter, chain: "Arc_Testnet" },
  to:   { adapter: ethAdapter, chain: "Ethereum_Sepolia" },
  amount: "2.00",
});
```

---

## 7. Unified Balance & Gateway (Optional Feature)

Gateway gives users a single USDC balance usable across all supported chains.
After initial deposit, transfers are sub-500ms.

```ts
// Deposit USDC into unified balance from Base
await kit.unifiedBalance.deposit({
  from: { adapter: baseAdapter, chain: "Base_Sepolia" },
  amount: "1.00",
  token: "USDC",
});

// Spend from unified balance on Arc
await kit.unifiedBalance.spend({
  amount: "1.50",
  from: { adapter: arcAdapter },
  to: {
    adapter: arcAdapter,
    chain: "Arc_Testnet",
    recipientAddress: "0xRecipient",
  },
});

// Estimate fees before spending
const estimate = await kit.unifiedBalance.estimateSpend({ ... });
```

**When to use Gateway vs CCTP:**
- CCTP → one-time large transfers, user bridging between chains
- Gateway → frequent small payments, in-app commerce, sub-second UX needed

---

## 8. AI Skills to Activate

When starting an Arc project in Claude Code / Cursor / Windsurf, activate these skills:

```bash
/plugin marketplace add circlefin/skills
/plugin install circle-skills@circle
```

Then in your first prompt:

```
Use skills: use-arc, use-usdc, swap-tokens, bridge-stablecoin,
use-gateway, unify-balance, use-smart-contract-platform.
Read docs and confirm when ready.
```

### Skill Reference

| Skill | Purpose |
|-------|---------|
| `use-arc` | Arc chain config, gas model, CCTP bridge to Arc |
| `use-usdc` | USDC balance, transfer, approve across EVM + Solana |
| `swap-tokens` | Same-chain swap via App Kit |
| `bridge-stablecoin` | CCTP bridge flows, UX patterns, progress tracking |
| `use-gateway` | Unified balance deposit/spend/estimate |
| `unify-balance` | Cross-chain USDC balance with App Kit |
| `use-smart-contract-platform` | Deploy/interact with contracts |

---

## 9. Environment Variables Required

```bash
# Arc
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_EXPLORER=https://testnet.arcscan.app

# Circle
CIRCLE_KIT_KEY=your_kit_key_from_circle_console
NEXT_PUBLIC_CIRCLE_KIT_KEY=your_kit_key_from_circle_console

# Tokens (Arc Testnet)
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_EURC_ADDRESS=0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
NEXT_PUBLIC_USYC_ADDRESS=0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C
NEXT_PUBLIC_CIRBTC_ADDRESS=TBD

# CCTP (Arc Testnet)
NEXT_PUBLIC_TOKEN_MESSENGER_V2=0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
NEXT_PUBLIC_MESSAGE_TRANSMITTER_V2=0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275

# Other Chains (Testnet)
NEXT_PUBLIC_ETH_SEPOLIA_RPC=https://rpc.sepolia.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Wallet (server-side only — NEVER expose to browser)
PRIVATE_KEY=your_private_key
```

---

## 10. Recommended Project Structure

```
arc-starter-kit/
├── .env.example                    # All env vars with placeholders
├── .env.local                      # Local secrets (gitignored)
├── README.md                       # Clone & run instructions
├── docs/
│   ├── SKILL.md                    # This file — feed to agent
│   └── BUILD_INSTRUCTIONS.md       # Agent build guide
├── src/
│   ├── config/
│   │   ├── chains.ts               # Chain definitions (Arc, ETH, Base)
│   │   ├── contracts.ts            # All contract addresses by network
│   │   └── tokens.ts               # Token list with addresses + metadata
│   ├── lib/
│   │   ├── appKitClient.ts         # App Kit + Viem adapter initialization
│   │   ├── wagmiConfig.ts          # Wagmi config for frontend wallet connect
│   │   └── viemClients.ts          # Public clients for each chain
│   ├── services/
│   │   ├── swapService.ts          # swapOnArc()
│   │   ├── bridgeService.ts        # bridgeUsdc(), bridgeEurc()
│   │   └── unifiedBalanceService.ts # deposit(), spend(), estimate()
│   ├── hooks/
│   │   ├── useSwap.ts              # React hook wrapping swapService
│   │   ├── useBridge.ts            # React hook wrapping bridgeService
│   │   └── useTokenBalance.ts      # Read USDC/EURC balance on any chain
│   ├── components/
│   │   ├── SwapWidget.tsx          # Swap UI (token selector + amount input)
│   │   ├── BridgeWidget.tsx        # Bridge UI (chain selector + amount)
│   │   ├── WalletConnect.tsx       # Connect wallet button
│   │   └── TxStatus.tsx            # Transaction status tracker
│   └── app/
│       ├── layout.tsx              # Root layout with providers
│       ├── page.tsx                # Home — tab switcher (Swap / Bridge)
│       ├── swap/page.tsx           # Swap page
│       └── bridge/page.tsx         # Bridge page
└── package.json
```

---

## 11. Key Implementation Rules

1. **Never hardcode addresses** — always pull from `config/contracts.ts` via env vars.
2. **Gas display** — always show fees in USDC to users, never in Gwei.
3. **cirBTC** — design token-agnostic swap module; add cirBTC address to config once Circle publishes it. Use placeholder now.
4. **Finality** — Arc has no reorgs. Treat tx as final after 1 confirmation.
5. **Error handling** — always catch and surface gas errors; map to user-friendly messages.
6. **Chain ID** — Arc Testnet = `5042002`. Wrong chain ID = silent failures. Validate on connect.
7. **USDC decimals** — ERC-20 uses 6 decimals. Gas accounting uses 18 internally — don't mix these up.
8. **Wallet connect** — use `createViemAdapterFromWalletClient` for browser; `createViemAdapterFromPrivateKey` for scripts/server only.
