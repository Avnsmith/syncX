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
      className="p-3 rounded bg-zinc-800 text-white border border-zinc-700"
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium">{type?.toUpperCase() || 'TRANSACTION'}</span>
        <span className={`font-medium ${status === 'completed' ? 'text-green-500' : status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>{status}</span>
      </div>
      <div className="text-xs text-zinc-400 mt-1">
        <div>ID: {id}</div>
        <div>Date: {new Date(date).toLocaleString()}</div>
        <div>Amount: {amount} {asset}</div>
        {category && <div>Category: {category}</div>}
      </div>
    </div>
  );
};
export default TransactionItem;
