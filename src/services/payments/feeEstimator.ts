export interface FeeEstimate {
  asset: string;
  amount: number;
  fee: number; // in USD
}

/** Mock fee estimator */
export function estimateFee(asset: string, amount: number): FeeEstimate {
  // Simple mock: flat 0.5% of amount in USD, assuming 1:1 for USDC, others approximate.
  const feeRate = 0.005;
  const fee = amount * feeRate;
  return { asset, amount, fee };
}
