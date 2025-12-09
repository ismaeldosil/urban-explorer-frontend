import { TestBed } from '@angular/core/testing';
import { OAuthLoginUseCase, OAuthLoginInput } from './oauth-login.usecase';
import { AUTH_PORT } from '@infrastructure/di/tokens';
import { IAuthPort, OAuthProvider } from '../../ports/auth.port';
import { DomainError } from '@core/errors/domain-error';

describe('OAuthLoginUseCase', () => {
  let useCase: OAuthLoginUseCase;
  let mockAuthPort: jasmine.SpyObj<IAuthPort>;

  beforeEach(() => {
    mockAuthPort = jasmine.createSpyObj('IAuthPort', [
      'signIn',
      'signUp',
      'signInWithOAuth',
      'signOut',
      'resetPassword',
      'getSession',
      'refreshSession',
      'onAuthStateChange',
    ]);

    TestBed.configureTestingModule({
      providers: [
        OAuthLoginUseCase,
        { provide: AUTH_PORT, useValue: mockAuthPort },
      ],
    });

    useCase = TestBed.inject(OAuthLoginUseCase);
  });

  describe('execute', () => {
    it('should return success when OAuth login succeeds with Google', async () => {
      mockAuthPort.signInWithOAuth.and.resolveTo();

      const input: OAuthLoginInput = { provider: 'google' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockAuthPort.signInWithOAuth).toHaveBeenCalledWith('google');
    });

    it('should return success when OAuth login succeeds with Apple', async () => {
      mockAuthPort.signInWithOAuth.and.resolveTo();

      const input: OAuthLoginInput = { provider: 'apple' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockAuthPort.signInWithOAuth).toHaveBeenCalledWith('apple');
    });

    it('should return OAUTH_ERROR when DomainError is thrown', async () => {
      const domainError = new DomainError('OAuth provider not available');
      mockAuthPort.signInWithOAuth.and.rejectWith(domainError);

      const input: OAuthLoginInput = { provider: 'google' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('OAUTH_ERROR');
        expect(result.error.message).toBe('OAuth provider not available');
      }
    });

    it('should return NETWORK_ERROR when generic Error is thrown', async () => {
      const error = new Error('Network connection failed');
      mockAuthPort.signInWithOAuth.and.rejectWith(error);

      const input: OAuthLoginInput = { provider: 'google' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Network connection failed');
      }
    });

    it('should return NETWORK_ERROR with default message when non-Error is thrown', async () => {
      mockAuthPort.signInWithOAuth.and.rejectWith('string error');

      const input: OAuthLoginInput = { provider: 'google' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('OAuth login failed');
      }
    });

    it('should call signInWithOAuth with correct provider', async () => {
      mockAuthPort.signInWithOAuth.and.resolveTo();

      const providers: OAuthProvider[] = ['google', 'apple'];

      for (const provider of providers) {
        await useCase.execute({ provider });
        expect(mockAuthPort.signInWithOAuth).toHaveBeenCalledWith(provider);
      }
    });
  });
});
