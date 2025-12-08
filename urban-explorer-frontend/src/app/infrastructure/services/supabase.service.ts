import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '@env';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject = new BehaviorSubject<Session | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
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
