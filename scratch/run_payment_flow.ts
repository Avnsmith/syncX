// scratch/run_payment_flow.ts
import { PaymentService } from '@/services/payments/paymentService';
import { PaymentRequest } from '@/services/payments/types';

async function test() {
  const service = PaymentService.getInstance();

  const requests: PaymentRequest[] = [
    { id: 'req1', fromType: 'human', toType: 'human', from: 'alice', to: 'bob', amount: 1000, asset: 'USDC', tags: [] }, // Circle default
    { id: 'req2', fromType: 'human', toType: 'human', from: 'carol', to: 'dave', amount: 2000, asset: 'USDC', tags: ['arc'] },
    { id: 'req3', fromType: 'human', toType: 'human', from: 'eve', to: 'frank', amount: 1500, asset: 'USDC', tags: ['payx'] },
    { id: 'req4', fromType: 'human', toType: 'human', from: 'grace', to: 'heidi', amount: 1200, asset: 'USDC', tags: ['stream'] },
  ];

  for (const req of requests) {
    const res = await service.processPayment(req);
    console.log('Request', req.id, 'Response', res);
  }
}

test().catch(console.error);
