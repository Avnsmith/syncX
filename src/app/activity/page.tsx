"use client";
import { useEffect, useState } from 'react';
import { MockTransactionService } from '@/services/payments/transactionService';
import { Transaction } from '@/lib/transaction';
import TransactionItem from '@/components/TransactionItem';
export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const service = new MockTransactionService();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await service.getTransactions();
      setTransactions(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let filteredData = transactions;
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      filteredData = filteredData.filter((t) => t.type === typeFilter);
    }
    setFiltered(filteredData);
  }, [transactions, statusFilter, typeFilter]);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-400">Loading transactions…</div>;
  }

  if (!transactions.length) {
    return <div className="text-center text-gray-500 py-20">No transaction history available.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Activity</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-1 bg-zinc-800 text-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded p-1 bg-zinc-800 text-white"
        >
          <option value="all">All Types</option>
          <option value="send">Send</option>
          <option value="receive">Receive</option>
          <option value="swap">Swap</option>
          <option value="payment">Payment</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400">No transactions match the selected filters.</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => (
            <li key={t.id}>
              <TransactionItem transaction={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
