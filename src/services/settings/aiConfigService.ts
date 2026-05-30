export interface IAIConfigService {
  /** Fetch current AI configuration */
  getConfig(): Promise<AIConfig>;
  /** Persist updated AI configuration */
  updateConfig(config: Partial<AIConfig>): Promise<AIConfig>;
}

/**
 * Mock implementation using localStorage (browser) for persistence.
 * In a real implementation, this would call a backend API.
 */
export class MockAIConfigService implements IAIConfigService {
  private storageKey = 'syncx_ai_config';

  async getConfig(): Promise<AIConfig> {
    if (typeof window === 'undefined') return this.defaultConfig();
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw) as AIConfig;
      } catch {
        return this.defaultConfig();
      }
    }
    return this.defaultConfig();
  }

  async updateConfig(config: Partial<AIConfig>): Promise<AIConfig> {
    const current = await this.getConfig();
    const updated = { ...current, ...config } as AIConfig;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    }
    return updated;
  }

  private defaultConfig(): AIConfig {
    return {
      responseStyle: 'concise',
      riskSensitivity: 'medium',
      transactionGuidance: true,
      paymentRecommendations: true,
    };
  }
}
