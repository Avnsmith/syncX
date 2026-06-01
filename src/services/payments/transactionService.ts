import { Transaction } from "@/lib/transaction";

/**
 * Transaction service managing transaction history.
 * Seamlessly integrates local storage persistent transactions with initial seeded items.
 */
export class MockTransactionService {
  private storageKey = "syncx_local_transactions";

  /**
   * Seed initial transactions in local storage if empty.
   */
  private seedInitialTransactions() {
    if (typeof window === "undefined") return [];

    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const initial: Transaction[] = [
        {
          id: "0x8fa3c56ebd111cbb052a781290eef5ba678ef02bcdd139a67a01c7d41a8ef1a0",
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          amount: 250.0,
          asset: "USDC",
          status: "completed",
          type: "send",
          category: "transfer",
        },
        {
          id: "0x39a1d82bc5c6dbeff1a052ff678a67efcdd139a67a01c7d4ba16a908a8ef5b4e",
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          amount: 50.0,
          asset: "EURC",
          status: "completed",
          type: "swap",
          category: "swap",
        },
        {
          id: "0x51c7d4ba16908a8ef5b4e39a1d82bc5c6dbeff1a052ff678a67efcdd139a67a0",
          date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          amount: 15.0,
          asset: "USDC",
          status: "failed",
          type: "send",
          category: "transfer",
        },
        {
          id: "0x78ef02bcdd139a67a01c7d41a8ef1a08fa3c56ebd111cbb052a781290eef5ba6",
          date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
          amount: 1000.0,
          asset: "USDC",
          status: "completed",
          type: "payment",
          category: "subscription",
        },
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(initial));
      return initial;
    }
    
    try {
      return JSON.parse(existing) as Transaction[];
    } catch {
      return [];
    }
  }

  /**
   * Get all persistent and seeded transactions.
   */
  async getTransactions(): Promise<Transaction[]> {
    if (typeof window === "undefined") return [];
    
    const transactions = this.seedInitialTransactions();
    // Sort transactions by date descending (latest first)
    return transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Append a new transaction to history.
   */
  async addTransaction(tx: Omit<Transaction, "date">): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      date: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const existing = await this.getTransactions();
      existing.unshift(newTx);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    }

    return newTx;
  }
}
