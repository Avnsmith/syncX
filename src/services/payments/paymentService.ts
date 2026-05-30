import { DefaultPaymentProcessor } from '@/services/payments/processor';
import { MockCircleProvider } from '@/services/circle/provider';
import { MockArcProvider } from '@/services/arc/provider';
import { MockPayXProvider } from '@/services/payx/provider';
import { MockStreamPayProvider } from '@/services/streampay/provider';
import { IPaymentProcessor, PaymentRequest, PaymentResponse } from '@/services/payments/types';

/**
 * Singleton PaymentService exposing a clean API for UI layers.
 * It abstracts away provider details and uses the DefaultPaymentProcessor.
 */
export class PaymentService {
  private static instance: PaymentService;
  private processor: IPaymentProcessor;

  private constructor() {
    const circle = new MockCircleProvider();
    const arc = new MockArcProvider();
    const payx = new MockPayXProvider();
    const streampay = new MockStreamPayProvider();
    this.processor = new DefaultPaymentProcessor(circle, arc, payx, streampay);
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.processor.process(request);
  }
}
