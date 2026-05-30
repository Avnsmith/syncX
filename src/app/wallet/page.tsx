import React from 'react';
import Link from 'next/link';
import { AssetCard } from '@/components/AssetCard';

// Placeholder data for assets
const assets = [
  {
    name: 'USD Coin',
    symbol: 'USDC',
    balance: '1,250.00',
    usdValue: '1,250.00',
    address: '0x1234...abcd',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '2.35',
    usdValue: '4,200.00',
    address: '0x5678...efgh',
  },
  {
    name: 'Arc Blockchain Token',
    symbol: 'ARC',
    balance: '5,000.00',
    usdValue: '5,000.00',
    address: '0x9abc...def0',
  },
];

export default function WalletPage() {
  return (
    <main className="min-h-screen p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet Overview</h1>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {assets.map((asset) => (
          <AssetCard
            key={asset.symbol}
            name={asset.name}
            symbol={asset.symbol}
            balance={asset.balance}
            usdValue={asset.usdValue}
            address={asset.address}
            onSend={() => {
              // navigate to send page with pre‑selected asset via query params
              // Using client‑side navigation
              window.location.href = `/send?asset=${asset.symbol}`;
            }}
            onReceive={() => {
              // placeholder receive flow – could open a modal later
              alert(`Receive ${asset.symbol} – address copied to clipboard`);
              navigator.clipboard.writeText(asset.address);
            }}
          />
        ))}
      </section>
      <nav className="flex space-x-4 mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <Link href="/send" className="text-blue-600 hover:underline">
          Send
        </Link>
        <Link href="/activity" className="text-blue-600 hover:underline">
          Activity
        </Link>
        <Link href="/assistant" className="text-blue-600 hover:underline">
          Assistant
        </Link>
        <Link href="/settings" className="text-blue-600 hover:underline">
          Settings
        </Link>
      </nav>
    </main>
  );
}
