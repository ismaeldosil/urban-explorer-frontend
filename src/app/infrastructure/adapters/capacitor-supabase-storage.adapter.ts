import { Preferences } from '@capacitor/preferences';

/**
 * Storage adapter for Supabase that uses Capacitor Preferences.
 * This implements the storage interface that Supabase expects for session persistence.
 * Works across web, iOS, and Android platforms.
 */
export const capacitorSupabaseStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
