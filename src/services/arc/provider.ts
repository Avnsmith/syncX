import { PaymentResponse } from '@/services/payments/types';

export interface IArcProvider {
  /** Process payment via Arc network */
  processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
  }): Promise<PaymentResponse>;
}

/** Simple mock Arc provider */
export class MockArcProvider implements IArcProvider {
  async processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
  }): Promise<PaymentResponse> {
    // Simulate instant success with no fee
    return {
      paymentId: request.id,
      status: 'completed',
      fee: { amount: 0, asset: request.asset, source: 'arc' },
    };
  }
}
