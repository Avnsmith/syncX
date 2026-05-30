import { PaymentResponse } from '@/services/payments/types';

export interface IPayXProvider {
  /** Process a PayX payment request */
  processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
  }): Promise<PaymentResponse>;
}

/** Mock PayX provider */
export class MockPayXProvider implements IPayXProvider {
  async processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
  }): Promise<PaymentResponse> {
    // Simulate a small fee and success
    const feeAmount = Math.floor(request.amount * 0.005); // 0.5%
    return {
      paymentId: request.id,
      status: 'completed',
      fee: { amount: feeAmount, asset: request.asset, source: 'payx' },
    };
  }
}
