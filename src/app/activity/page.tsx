"use client";

import { useEffect, useState } from "react";
import { MockTransactionService } from "@/services/payments/transactionService";
import { Transaction } from "@/lib/transaction";
import TransactionItem from "@/components/TransactionItem";
import { ListFilter, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const service = new MockTransactionService();

  const loadTransactions = async () => {
    setLoading(true);
    const data = await service.getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filteredData = transactions;
    if (statusFilter !== "all") {
      filteredData = filteredData.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filteredData = filteredData.filter((t) => t.type === typeFilter);
    }
    setFiltered(filteredData);
  }, [transactions, statusFilter, typeFilter]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ListFilter className="h-8 w-8 text-sky-600" />
            Transaction Activity
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and audit your stablecoin payments, swaps, and transfers.
          </p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-xs font-bold">Reload</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="h-4.5 w-4.5 text-slate-400" />
          Filter History:
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none focus:border-sky-500/50 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none focus:border-sky-500/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="send">Send</option>
              <option value="receive">Receive</option>
              <option value="swap">Swap</option>
              <option value="payment">Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Render Box */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500 font-semibold gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-sky-600" />
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 border-dashed rounded-3xl py-20 px-4 text-slate-400 font-medium space-y-3">
          <p className="text-sm">No transactions match the selected filters.</p>
          <div className="text-xs text-slate-400">
            Head to the{" "}
            <Link href="/send" className="text-sky-600 hover:underline font-bold">
              Send page
            </Link>{" "}
            to execute a new transfer!
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((t) => (
            <li key={t.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <TransactionItem transaction={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
