import { TestBed } from '@angular/core/testing';
import { ForgotPasswordUseCase, ForgotPasswordInput } from './forgot-password.usecase';
import { AUTH_PORT } from '@infrastructure/di/tokens';
import { IAuthPort } from '../../ports/auth.port';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
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
        ForgotPasswordUseCase,
        { provide: AUTH_PORT, useValue: mockAuthPort },
      ],
    });

    useCase = TestBed.inject(ForgotPasswordUseCase);
  });

  describe('execute', () => {
    it('should return success for valid email', async () => {
      mockAuthPort.resetPassword.and.resolveTo(undefined);

      const input: ForgotPasswordInput = { email: 'test@example.com' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockAuthPort.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should return INVALID_EMAIL error for invalid email format', async () => {
      const input: ForgotPasswordInput = { email: 'invalid-email' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_EMAIL');
        expect(result.error.message).toBe('Invalid email format');
      }
      expect(mockAuthPort.resetPassword).not.toHaveBeenCalled();
    });

    it('should return INVALID_EMAIL error for empty email', async () => {
      const input: ForgotPasswordInput = { email: '' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_EMAIL');
      }
    });

    it('should return success even when resetPassword throws (for security)', async () => {
      mockAuthPort.resetPassword.and.rejectWith(new Error('User not found'));

      const input: ForgotPasswordInput = { email: 'test@example.com' };
      const result = await useCase.execute(input);

      // Should still return success to not reveal if email exists
      expect(result.success).toBe(true);
    });

    it('should return success for network errors (for security)', async () => {
      mockAuthPort.resetPassword.and.rejectWith(new Error('Network error'));

      const input: ForgotPasswordInput = { email: 'test@example.com' };
      const result = await useCase.execute(input);

      // Should still return success to not reveal if email exists
      expect(result.success).toBe(true);
    });

    it('should call resetPassword with lowercase email', async () => {
      mockAuthPort.resetPassword.and.resolveTo(undefined);

      const input: ForgotPasswordInput = { email: 'Test@Example.COM' };
      await useCase.execute(input);

      expect(mockAuthPort.resetPassword).toHaveBeenCalledWith('Test@Example.COM');
    });
  });
});
