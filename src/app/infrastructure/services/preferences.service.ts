import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type DistanceUnit = 'km' | 'miles';
export type Language = 'en' | 'es';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserPreferences {
  distanceUnit: DistanceUnit;
  language: Language;
  theme: ThemeMode;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  distanceUnit: 'km',
  language: 'en',
  theme: 'auto',
  pushNotifications: true,
  emailNotifications: true,
};

const PREFERENCES_KEY = 'user-preferences';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private preferences = signal<UserPreferences>(DEFAULT_PREFERENCES);

  readonly distanceUnit = signal<DistanceUnit>(DEFAULT_PREFERENCES.distanceUnit);
  readonly language = signal<Language>(DEFAULT_PREFERENCES.language);
  readonly theme = signal<ThemeMode>(DEFAULT_PREFERENCES.theme);
  readonly pushNotifications = signal<boolean>(DEFAULT_PREFERENCES.pushNotifications);
  readonly emailNotifications = signal<boolean>(DEFAULT_PREFERENCES.emailNotifications);

  constructor() {
    this.loadPreferences();
  }

  private async loadPreferences(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: PREFERENCES_KEY });
      if (value) {
        const prefs = JSON.parse(value) as UserPreferences;
        this.preferences.set(prefs);
        this.updateSignals(prefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  private updateSignals(prefs: UserPreferences): void {
    this.distanceUnit.set(prefs.distanceUnit);
    this.language.set(prefs.language);
    this.theme.set(prefs.theme);
    this.pushNotifications.set(prefs.pushNotifications);
    this.emailNotifications.set(prefs.emailNotifications);
  }

  async updateDistanceUnit(unit: DistanceUnit): Promise<void> {
    const prefs = { ...this.preferences(), distanceUnit: unit };
    await this.savePreferences(prefs);
  }

  async updateLanguage(language: Language): Promise<void> {
    const prefs = { ...this.preferences(), language };
    await this.savePreferences(prefs);
  }

  async updateTheme(theme: ThemeMode): Promise<void> {
    const prefs = { ...this.preferences(), theme };
    await this.savePreferences(prefs);
    this.applyTheme(theme);
  }

  async updatePushNotifications(enabled: boolean): Promise<void> {
    const prefs = { ...this.preferences(), pushNotifications: enabled };
    await this.savePreferences(prefs);
  }

  async updateEmailNotifications(enabled: boolean): Promise<void> {
    const prefs = { ...this.preferences(), emailNotifications: enabled };
    await this.savePreferences(prefs);
  }

  private async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      await Preferences.set({
        key: PREFERENCES_KEY,
        value: JSON.stringify(prefs),
      });
      this.preferences.set(prefs);
      this.updateSignals(prefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  private applyTheme(theme: ThemeMode): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let shouldUseDark = false;

    if (theme === 'auto') {
      shouldUseDark = prefersDark;
    } else if (theme === 'dark') {
      shouldUseDark = true;
    }

    document.body.classList.toggle('dark', shouldUseDark);
  }

  getPreferences(): UserPreferences {
    return this.preferences();
  }
}
