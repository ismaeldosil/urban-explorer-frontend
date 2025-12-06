import { Injectable } from '@angular/core';
import { IAuthPort, AuthCredentials, RegisterData, AuthSession } from '@application/ports/auth.port';
import { SupabaseService } from '../services/supabase.service';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';
import { DomainError } from '@core/errors/domain-error';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthAdapter implements IAuthPort {
  constructor(private supabase: SupabaseService) {}

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const { data, error } = await this.supabase.signIn(
      credentials.email,
      credentials.password
    );

    if (error) {
      throw new DomainError(error.message, 'AUTH_ERROR');
    }

    if (!data.session || !data.user) {
      throw new DomainError('Login failed', 'AUTH_ERROR');
    }

    // Fetch profile
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const user = UserEntity.create({
      id: data.user.id,
      email: Email.create(data.user.email!),
      username: profile?.username || data.user.email!.split('@')[0],
      avatarUrl: profile?.avatar_url,
      bio: profile?.bio,
      location: profile?.location,
      emailVerified: data.user.email_confirmed_at !== null,
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
    };
  }

  async signUp(data: RegisterData): Promise<AuthSession> {
    const { data: authData, error: authError } = await this.supabase.signUp(
      data.email,
      data.password,
      { username: data.username }
    );

    if (authError) {
      throw new DomainError(authError.message, 'AUTH_ERROR');
    }

    if (!authData.session || !authData.user) {
      throw new DomainError('Registration failed', 'AUTH_ERROR');
    }

    // Create profile
    const { error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: data.username,
        email: data.email,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    const user = UserEntity.create({
      id: authData.user.id,
      email: Email.create(data.email),
      username: data.username,
      emailVerified: false,
    });

    return {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at || 0,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.signOut();
    if (error) {
      throw new DomainError(error.message, 'AUTH_ERROR');
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.resetPassword(email);
    if (error) {
      throw new DomainError(error.message, 'AUTH_ERROR');
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.supabase.getSession();
    if (!data.session) return null;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    const user = UserEntity.create({
      id: data.session.user.id,
      email: Email.create(data.session.user.email!),
      username: profile?.username || 'user',
      avatarUrl: profile?.avatar_url,
      bio: profile?.bio,
      location: profile?.location,
      emailVerified: data.session.user.email_confirmed_at !== null,
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
    };
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.supabase.refreshSession();
    if (error || !data.session) {
      throw new DomainError('Failed to refresh session', 'AUTH_ERROR');
    }

    const session = await this.getSession();
    if (!session) {
      throw new DomainError('No session found', 'AUTH_ERROR');
    }

    return session;
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const subscription = this.supabase.session$.subscribe(async (session) => {
      if (session) {
        const authSession = await this.getSession();
        callback(authSession);
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }
}
