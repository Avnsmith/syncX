export interface IProfileService {
  /** Retrieve the current user profile */
  getProfile(): Promise<UserProfile>;
  /** Update user profile fields */
  updateProfile(update: Partial<UserProfile>): Promise<UserProfile>;
}

/**
 * Mock implementation storing profile in localStorage.
 * In production replace with backend API.
 */
export class MockProfileService implements IProfileService {
  private storageKey = 'syncx_user_profile';

  async getProfile(): Promise<UserProfile> {
    if (typeof window === 'undefined') return this.defaultProfile();
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw) as UserProfile;
      } catch {
        return this.defaultProfile();
      }
    }
    return this.defaultProfile();
  }

  async updateProfile(update: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...update } as UserProfile;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    }
    return updated;
  }

  private defaultProfile(): UserProfile {
    return {
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      avatarUrl: undefined,
    };
  }
}
