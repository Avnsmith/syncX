"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function SendPage() {
  const [asset, setAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!amount || !recipient) {
      alert('Please fill all fields');
      return;
    }
    setShowConfirm(true);
  };

  const confirmTransaction = () => {
    // Placeholder success flow
    setShowConfirm(false);
    alert(`Transaction sent!\nAsset: ${asset}\nAmount: ${amount}\nRecipient: ${recipient}`);
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Send Crypto</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full rounded bg-gray-800 text-white p-2"
          >
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
            <option value="ARC">ARC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded bg-gray-800 text-white p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full rounded bg-gray-800 text-white p-2"
            required
          />
        </div>
        {/* Fee estimate placeholder */}
        <div className="text-gray-400 text-sm">Estimated fee: <span className="text-white">~0.001 {asset}</span></div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Continue
        </button>
      </form>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Transaction</h2>
            <p className="mb-2">Asset: {asset}</p>
            <p className="mb-2">Amount: {amount}</p>
            <p className="mb-4">Recipient: {recipient}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransaction}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-500"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
