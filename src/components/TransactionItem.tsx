import React from 'react';
import { Transaction } from '@/lib/transaction';

export interface TransactionItemProps {
  transaction: Transaction;
}

/**
 * Simple accessible transaction item used in Activity page.
 * Displays basic info with proper ARIA labels.
 */
const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { id, date, amount, asset, status, type, category } = transaction;
  return (
    <div
      role="listitem"
      aria-label={`Transaction ${id}`}
      className="p-4 rounded-2xl bg-white text-slate-800 border border-slate-100 shadow-sm transition hover:shadow-md"
    >
      <div className="flex justify-between items-center text-sm font-bold">
        <span className="text-slate-900 tracking-tight">{type?.toUpperCase() || 'TRANSACTION'}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
          status === 'completed'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : status === 'pending'
            ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status}
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-3 space-y-1 font-medium">
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span>Amount</span>
          <span className="font-extrabold text-slate-800">{amount} {asset}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span>TX Hash</span>
          <a
            href={asset === "USDC" ? `https://testnet.arcscan.app/tx/${id}` : `https://sepolia.etherscan.io/tx/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sky-600 hover:underline flex items-center gap-0.5"
          >
            {id.slice(0, 10)}...{id.slice(-8)}
          </a>
        </div>
        <div className="flex justify-between">
          <span>Timestamp</span>
          <span>{new Date(date).toLocaleString()}</span>
        </div>
        {category && (
          <div className="flex justify-between border-t border-slate-100 pt-1">
            <span>Category</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-600">{category}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default TransactionItem;
