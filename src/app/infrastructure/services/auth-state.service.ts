import { Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { SupabaseService } from './supabase.service';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserEntity }
  | { status: 'unauthenticated' };

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private authState = signal<AuthState>({ status: 'loading' });
  private initializationPromise: Promise<void> | null = null;

  readonly state = this.authState.asReadonly();
  readonly isAuthenticated = computed(() => this.authState().status === 'authenticated');
  readonly isLoading = computed(() => this.authState().status === 'loading');
  readonly currentUser = computed(() => {
    const state = this.authState();
    return state.status === 'authenticated' ? state.user : null;
  });

  readonly state$ = toObservable(this.authState);

  constructor(private supabase: SupabaseService) {
    this.initializationPromise = this.initializeAuthState();
  }

  /**
   * Wait for auth state to be fully initialized.
   * Call this before accessing auth state if you need to ensure session is restored.
   */
  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  private async initializeAuthState(): Promise<void> {
    // Wait for Supabase to restore session from storage
    await this.supabase.waitForInitialization();

    // Listen to session changes
    this.supabase.session$.subscribe(async (session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id, session.user.email!, session.user.email_confirmed_at ?? null);
      } else {
        this.authState.set({ status: 'unauthenticated' });
      }
    });
  }

  private async loadUserProfile(userId: string, email: string, emailConfirmedAt: string | null): Promise<void> {
    try {
      // Fetch user profile from profiles table
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        this.authState.set({ status: 'unauthenticated' });
        return;
      }

      if (profile) {
        const user = UserEntity.create({
          id: userId,
          email: Email.create(email),
          username: profile.username,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          emailVerified: emailConfirmedAt !== null,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
        });

        this.authState.set({ status: 'authenticated', user });
        console.log('Session restored for user:', user.username);
      } else {
        this.authState.set({ status: 'unauthenticated' });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.authState.set({ status: 'unauthenticated' });
    }
  }

  setUser(user: UserEntity) {
    this.authState.set({ status: 'authenticated', user });
  }

  clearUser() {
    this.authState.set({ status: 'unauthenticated' });
  }
}
