export interface IStreamPayProvider {
  /** Process a streaming payment / subscription */
  processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
    /** Duration in seconds for the stream */
    duration?: number;
  }): Promise<PaymentResponse>;
}

/** Mock StreamPay provider
 * Simulates a subscription that deducts amount over time.
 * For the mock, we just return completed instantly and include a fee.
 */
export class MockStreamPayProvider implements IStreamPayProvider {
  async processPayment(request: {
    id: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    memo?: string;
    duration?: number;
  }): Promise<PaymentResponse> {
    const feeAmount = Math.floor(request.amount * 0.008); // 0.8% fee
    return {
      paymentId: request.id,
      status: 'completed',
      fee: { amount: feeAmount, asset: request.asset, source: 'streampay' },
    };
  }
}
