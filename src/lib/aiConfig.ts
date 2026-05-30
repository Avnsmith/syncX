export interface AIConfig {
  /** Preferred response style, e.g., concise, detailed, friendly */
  responseStyle: 'concise' | 'detailed' | 'friendly' | string;
  /** Risk sensitivity for payment recommendations */
  riskSensitivity: 'low' | 'medium' | 'high' | string;
  /** Guidance for transaction assistance */
  transactionGuidance: boolean;
  /** Whether to suggest payment options */
  paymentRecommendations: boolean;
  /** Placeholder for future personalisation fields */
  [key: string]: any;
}
