import { PaymentResponse } from '@/services/payments/types';

export interface ICircleProvider {
  /** Get USDC balance for a wallet address */
  getBalance(address: string): Promise<number>;
  /** Transfer USDC to another address */
  transfer(request: {
    from: string;
    to: string;
    amount: number;
    memo?: string;
  }): Promise<PaymentResponse>;
}

/** Mock Circle provider using localStorage (for demo) */
export class MockCircleProvider implements ICircleProvider {
  private storageKey = 'mock_circle_balances';

  private async getBalances(): Promise<Record<string, number>> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : {};
  }

  private async setBalances(balances: Record<string, number>) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(balances));
    }
  }

  async getBalance(address: string): Promise<number> {
    const balances = await this.getBalances();
    return balances[address] ?? 0;
  }

  async transfer(request: { from: string; to: string; amount: number; memo?: string; }): Promise<PaymentResponse> {
    const balances = await this.getBalances();
    const fromBal = balances[request.from] ?? 0;
    if (fromBal < request.amount) {
      return { paymentId: request.from + '_' + request.to, status: 'failed', error: 'Insufficient balance' };
    }
    balances[request.from] = fromBal - request.amount;
    balances[request.to] = (balances[request.to] ?? 0) + request.amount;
    await this.setBalances(balances);
    return { paymentId: request.from + '_' + request.to, status: 'completed' };
  }
}
