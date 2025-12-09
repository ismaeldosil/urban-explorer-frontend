import { TestBed } from '@angular/core/testing';
import { LoginUseCase, LoginInput } from './login.usecase';
import { AUTH_PORT } from '@infrastructure/di/tokens';
import { IAuthPort, AuthSession } from '../../ports/auth.port';
import { DomainError } from '@core/errors/domain-error';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthPort: jasmine.SpyObj<IAuthPort>;

  const createMockSession = (): AuthSession => {
    const mockUser = UserEntity.create({
      id: 'user-123',
      email: Email.create('test@example.com'),
      username: 'testuser',
      emailVerified: true,
    });
    return {
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
    };
  };

  beforeEach(() => {
    mockAuthPort = jasmine.createSpyObj('IAuthPort', ['signIn', 'signUp', 'signOut', 'getSession']);

    TestBed.configureTestingModule({
      providers: [
        LoginUseCase,
        { provide: AUTH_PORT, useValue: mockAuthPort },
      ],
    });

    useCase = TestBed.inject(LoginUseCase);
  });

  describe('execute', () => {
    it('should return success result with session on valid login', async () => {
      const mockSession = createMockSession();
      mockAuthPort.signIn.and.resolveTo(mockSession);

      const input: LoginInput = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe(mockSession.accessToken);
        expect(result.data.user.id).toBe('user-123');
      }
      expect(mockAuthPort.signIn).toHaveBeenCalledWith({
        email: input.email,
        password: input.password,
      });
    });

    it('should return INVALID_EMAIL error for invalid email format', async () => {
      const input: LoginInput = {
        email: 'invalid-email',
        password: 'validPassword123',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_EMAIL');
      }
      expect(mockAuthPort.signIn).not.toHaveBeenCalled();
    });

    it('should return INVALID_EMAIL error for empty email', async () => {
      const input: LoginInput = {
        email: '',
        password: 'validPassword123',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_EMAIL');
      }
    });

    it('should return INVALID_PASSWORD error for empty password', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: '',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PASSWORD');
        expect(result.error.message).toBe('Password is required');
      }
    });

    it('should return INVALID_CREDENTIALS error for DomainError', async () => {
      mockAuthPort.signIn.and.rejectWith(new DomainError('Invalid credentials'));

      const input: LoginInput = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
      }
    });

    it('should return INVALID_CREDENTIALS error for "Invalid login credentials" message', async () => {
      mockAuthPort.signIn.and.rejectWith(new Error('Invalid login credentials'));

      const input: LoginInput = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
        expect(result.error.message).toBe('Invalid email or password');
      }
    });

    it('should return NETWORK_ERROR for other errors', async () => {
      mockAuthPort.signIn.and.rejectWith(new Error('Network error'));

      const input: LoginInput = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Network error');
      }
    });

    it('should return NETWORK_ERROR with default message for non-Error throws', async () => {
      mockAuthPort.signIn.and.rejectWith('Something went wrong');

      const input: LoginInput = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Login failed');
      }
    });

    it('should validate various email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'no@domain',
        'spaces in@email.com',
      ];

      for (const email of invalidEmails) {
        const result = await useCase.execute({ email, password: 'password123' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_EMAIL');
        }
      }
    });

    it('should accept valid email formats', async () => {
      const mockSession = createMockSession();
      mockAuthPort.signIn.and.resolveTo(mockSession);

      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
      ];

      for (const email of validEmails) {
        const result = await useCase.execute({ email, password: 'password123' });
        expect(result.success).toBe(true);
      }
    });
  });
});
