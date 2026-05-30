export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number; // in smallest unit (e.g., cents) or float
  asset: string; // e.g., 'USDC'
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive' | 'swap' | 'payment';
  // optional category for agent payments
  category?: string;
}
