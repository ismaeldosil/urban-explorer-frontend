import { UserEntity } from '@core/entities/user.entity';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
}

export interface AuthSession {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface IAuthPort {
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  signUp(data: RegisterData): Promise<AuthSession>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}
