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
    address:  "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF",
    logoUrl:  "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
  },
];

export const BRIDGE_CHAINS = [
  {
    id:      5042002,
    name:    "Arc Testnet",
    appKitId: "Arc_Testnet" as const,
    logoUrl: "https://cdn.prod.website-files.com/685311a976e7c248b5dfde95/68921f69e5659feee825637e_9a3d143150a36125b5d7f0c2367c9ca6_arc-favicon-test.png",
  },
  {
    id:      11155111,
    name:    "Ethereum Sepolia",
    appKitId: "Ethereum_Sepolia" as const,
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  {
    id:      84532,
    name:    "Base Sepolia",
    appKitId: "Base_Sepolia" as const,
    logoUrl: "https://cryptologos.cc/logos/base-base-logo.svg",
  },
] as const;
