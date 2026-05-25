# ⚡ Arc Starter Kit - Quick Start Guide

Welcome to the **Arc Starter Kit**! This is a simplified, production-ready EVM decentralized application (dApp) boilerplate designed to help developers quickly build swap, bridge, and unified balance interfaces on the **Arc Network** using **Circle's Web3 AppKit SDK**.

---

## 🚀 Quick Start

### Step 1: Clone & Install Thrid-Party Libraries
```bash
# Clone the repository
git clone https://github.com/your-org/arc-starter-kit.git
cd arc-starter-kit

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables (.env)
1. Copy the example configuration template:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your **Circle Kit Key** (other settings like testnet RPCs and contract addresses are already pre-filled for you):
   ```bash
   NEXT_PUBLIC_CIRCLE_KIT_KEY=KIT_KEY:xxxxxx:yyyyyyyyyy # Fill in your Kit Key here
   ```

### Step 3: Run the Development Server
```bash
npm run dev
```
👉 Open your browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 How to get your Circle Kit API Key
To enable Swap & Bridge operations, you need a free Web3 AppKit **Kit Key** from the Circle Developer Console:
1. Navigate to the **[Circle Console](https://console.circle.com)**.
2. Sign up or log in to your developer account.
3. In the left-hand navigation menu, find **Developer Console** -> click **API Keys** (or go directly to **[Circle Console Keys Page](https://console.circle.com/keys)**).
4. Click **Create Kit Key** to generate a new key credential.
5. Copy the generated Kit Key string (which starts with `KIT_KEY:...`) and paste it as the value for `NEXT_PUBLIC_CIRCLE_KIT_KEY` in your `.env.local` file.

---

## 💧 How to Claim Testnet Tokens & Gas (Circle Faucet)
Since **USDC is the native gas token** on the Arc Network, you must acquire testnet USDC before sending any transaction:

### 1. Request Gas USDC / EURC on Arc Testnet:
1. Go to the official **[Circle Faucet](https://faucet.circle.com)**.
2. Select **Arc Testnet** in the **Select Network** dropdown.
3. Enter your Web3 browser wallet address (e.g. MetaMask).
4. Select **USDC** and click **Claim USDC**.
5. Repeat the process: Select **Arc Testnet**, choose **EURC**, and click **Claim EURC** to test same-chain USDC ↔ EURC Swaps.

### 2. Request Tokens on Source Chains to test CCTP Bridge:
1. On the Circle Faucet, select your bridge source network (e.g., **Base Sepolia** or **Ethereum Sepolia**).
2. Enter your address, select **USDC** or **EURC**, and claim the tokens.
3. **Note:** To trigger a bridge transaction from Sepolia chains, you also need a tiny amount of native gas (e.g. **Base Sepolia ETH** or **Ethereum Sepolia ETH**). You can acquire this native gas from popular community faucets (such as *Alchemy Faucet* or *Sepolia PoW Faucet*).

---

## 📋 Stablecoin Contract Addresses (Arc Testnet)

Use the official token addresses below to import them into your personal Web3 wallet:

| Token | Contract Address (Arc Testnet) | Decimals |
| :--- | :--- | :--- |
| **USDC** | `0x3600000000000000000000000000000000000000` | 6 |
| **EURC** | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 |
| **USYC** | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | 6 |
| **cirBTC** | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` | 8 |

---

## 🤝 Need Support?
If you encounter any issues or need assistance configuring and expanding this boilerplate, reach out directly on X (Twitter):  
👉 **[https://x.com/trungkts29](https://x.com/trungkts29)**
