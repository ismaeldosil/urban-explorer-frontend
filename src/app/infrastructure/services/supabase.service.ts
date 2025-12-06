import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '@env';
import { BehaviorSubject, Observable } from 'rxjs';
import { capacitorSupabaseStorage } from '../adapters/capacitor-supabase-storage.adapter';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private initialized = false;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: capacitorSupabaseStorage,
          storageKey: 'urban-explorer-auth',
        },
      }
    );

    this.initializeAuth();
  }

  /**
   * Initialize auth state listener and restore session from storage.
   * This ensures the session is restored on app start.
   */
  private async initializeAuth(): Promise<void> {
    // Listen to auth state changes
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.email);
      this.sessionSubject.next(session);
    });

    // Restore existing session from storage
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Error restoring session:', error);
        this.sessionSubject.next(null);
      } else {
        this.sessionSubject.next(session);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.sessionSubject.next(null);
    }

    this.initialized = true;
  }

  /**
   * Returns a promise that resolves when the auth state has been initialized.
   * Use this to wait for session restoration before proceeding.
   */
  async waitForInitialization(): Promise<void> {
    if (this.initialized) return;

    // Wait for first emission from session subject
    return new Promise((resolve) => {
      const subscription = this.sessionSubject.subscribe(() => {
        if (this.initialized) {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get session$(): Observable<Session | null> {
    return this.sessionSubject.asObservable();
  }

  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  get currentUser(): User | null {
    return this.sessionSubject.value?.user ?? null;
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'urbanexplorer://auth/reset-password',
    });
  }

  async updatePassword(newPassword: string) {
    return this.supabase.auth.updateUser({ password: newPassword });
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  async refreshSession() {
    return this.supabase.auth.refreshSession();
  }

  // OAuth
  async signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  async signInWithApple() {
    return this.supabase.auth.signInWithOAuth({ provider: 'apple' });
  }

  // Database helpers
  from(table: string) {
    return this.supabase.from(table);
  }

  // Storage helpers
  storage(bucket: string) {
    return this.supabase.storage.from(bucket);
  }

  // RPC (stored procedures)
  rpc(fn: string, params?: Record<string, any>) {
    return this.supabase.rpc(fn, params);
  }
}
