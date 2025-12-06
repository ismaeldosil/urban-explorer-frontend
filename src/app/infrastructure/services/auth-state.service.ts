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

  readonly state = this.authState.asReadonly();
  readonly isAuthenticated = computed(() => this.authState().status === 'authenticated');
  readonly isLoading = computed(() => this.authState().status === 'loading');
  readonly currentUser = computed(() => {
    const state = this.authState();
    return state.status === 'authenticated' ? state.user : null;
  });

  readonly state$ = toObservable(this.authState);

  constructor(private supabase: SupabaseService) {
    this.initializeAuthState();
  }

  private async initializeAuthState() {
    // Listen to session changes
    this.supabase.session$.subscribe(async (session) => {
      if (session?.user) {
        try {
          // Fetch user profile from profiles table
          const { data: profile } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const user = UserEntity.create({
              id: session.user.id,
              email: Email.create(session.user.email!),
              username: profile.username,
              avatarUrl: profile.avatar_url,
              bio: profile.bio,
              location: profile.location,
              emailVerified: session.user.email_confirmed_at !== null,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at),
            });

            this.authState.set({ status: 'authenticated', user });
          } else {
            this.authState.set({ status: 'unauthenticated' });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          this.authState.set({ status: 'unauthenticated' });
        }
      } else {
        this.authState.set({ status: 'unauthenticated' });
      }
    });
  }

  setUser(user: UserEntity) {
    this.authState.set({ status: 'authenticated', user });
  }

  clearUser() {
    this.authState.set({ status: 'unauthenticated' });
  }
}
