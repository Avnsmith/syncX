import React from 'react';

interface AssetCardProps {
  name: string;
  symbol: string;
  balance: string;
  usdValue: string;
  onSend?: () => void;
  onReceive?: () => void;
  address?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  name,
  symbol,
  balance,
  usdValue,
  onSend,
  onReceive,
  address,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow transition hover:shadow-lg">
      <h2 className="text-lg font-semibold mb-2">{name} ({symbol})</h2>
      <p className="text-sm text-gray-600">Balance: {balance}</p>
      <p className="text-sm text-gray-600">≈ ${usdValue}</p>
      <div className="mt-3 flex space-x-2">
        {onSend && (
          <button
            onClick={onSend}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        )}
        {onReceive && (
          <button
            onClick={onReceive}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Receive
          </button>
        )}
        {address && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(address);
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
};
