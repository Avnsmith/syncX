import { Transaction } from '@/lib/transaction';

/**
 * Mock transaction service returning sample transactions.
 * Replace with real API integration when available.
 */
export class MockTransactionService {
  /**
   * Returns a list of mock transactions.
   */
  async getTransactions(): Promise<Transaction[]> {
    // Sample data covering various statuses and types
    return [
      {
        id: 'tx1',
        date: new Date().toISOString(),
        amount: 2500,
        asset: 'USDC',
        status: 'completed',
        type: 'send',
        category: 'agent-payment',
      },
      {
        id: 'tx2',
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 1000,
        asset: 'USDC',
        status: 'pending',
        type: 'receive',
      },
      {
        id: 'tx3',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        amount: 500,
        asset: 'USDC',
        status: 'failed',
        type: 'swap',
      },
      {
        id: 'tx4',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        amount: 750,
        asset: 'USDC',
        status: 'completed',
        type: 'payment',
        category: 'subscription',
      },
    ];
  }
}
