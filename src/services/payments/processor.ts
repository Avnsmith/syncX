// src/services/payments/processor.ts
import { IPaymentProcessor, PaymentRequest, PaymentResponse, FeeInfo } from './types';
import { ICircleProvider } from '@/services/circle/provider';
import { IArcProvider } from '@/services/arc/provider';
import { IPayXProvider } from '@/services/payx/provider';
import { IStreamPayProvider } from '@/services/streampay/provider';

/**
 * Default payment processor that delegates to the appropriate provider based on tags.
 * This implementation is deliberately simple and uses mock providers.
 */
export class DefaultPaymentProcessor implements IPaymentProcessor {
  constructor(
    private circle: ICircleProvider,
    private arc: IArcProvider,
    private payx: IPayXProvider,
    private streamPay: IStreamPayProvider,
  ) {}

  async process(request: PaymentRequest): Promise<PaymentResponse> {
    // Determine routing
    if (request.tags?.includes('arc')) {
      return this.arc.processPayment(request);
    }
    if (request.tags?.includes('payx')) {
      return this.payx.processPayment(request);
    }
    if (request.tags?.includes('stream')) {
      return this.streamPay.processPayment(request);
    }
    // Default to Circle (USDC) provider
    const paymentId = `${request.from}->${request.to}`;
    // simple fee: 1% of amount
    const feeAmount = Math.floor(request.amount * 0.01);
    const fee: FeeInfo = { amount: feeAmount, asset: request.asset, source: 'circle' };
    // Perform transfer via Circle provider
    const transferResult = await this.circle.transfer({
      from: request.from,
      to: request.to,
      amount: request.amount - feeAmount,
      memo: request.memo,
    });
    return {
      paymentId,
      status: transferResult.status,
      error: transferResult.error,
      fee,
    };
  }
}
