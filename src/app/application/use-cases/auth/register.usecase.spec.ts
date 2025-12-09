import { TestBed } from '@angular/core/testing';
import { RegisterUseCase, RegisterInput } from './register.usecase';
import { AUTH_PORT, USER_REPOSITORY } from '@infrastructure/di/tokens';
import { IAuthPort, AuthSession } from '../../ports/auth.port';
import { IUserRepository } from '@core/repositories/user.repository';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockAuthPort: jasmine.SpyObj<IAuthPort>;
  let mockUserRepository: jasmine.SpyObj<IUserRepository> & { isUsernameAvailable: jasmine.Spy };

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
    mockUserRepository = jasmine.createSpyObj('IUserRepository', [
      'findById',
      'findByEmail',
      'findByUsername',
      'save',
      'update',
      'delete',
      'isUsernameAvailable',
    ]) as jasmine.SpyObj<IUserRepository> & { isUsernameAvailable: jasmine.Spy };

    TestBed.configureTestingModule({
      providers: [
        RegisterUseCase,
        { provide: AUTH_PORT, useValue: mockAuthPort },
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    });

    useCase = TestBed.inject(RegisterUseCase);
  });

  describe('execute', () => {
    const validInput: RegisterInput = {
      email: 'test@example.com',
      password: 'ValidPass123!',
      username: 'testuser',
    };

    it('should return success result with session on valid registration', async () => {
      const mockSession = createMockSession();
      mockAuthPort.signUp.and.resolveTo(mockSession);
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe(mockSession.accessToken);
        expect(result.data.user.id).toBe('user-123');
      }
      expect(mockAuthPort.signUp).toHaveBeenCalledWith({
        email: validInput.email,
        password: validInput.password,
        username: validInput.username,
      });
    });

    it('should return INVALID_EMAIL error for invalid email', async () => {
      const input = { ...validInput, email: 'invalid-email' };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_EMAIL');
      }
      expect(mockAuthPort.signUp).not.toHaveBeenCalled();
    });

    it('should return INVALID_PASSWORD error for weak password', async () => {
      const input = { ...validInput, password: 'weak' };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PASSWORD');
      }
    });

    it('should return INVALID_USERNAME error for short username', async () => {
      const input = { ...validInput, username: 'ab' };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_USERNAME');
        expect(result.error.message).toBe('Username must be at least 3 characters');
      }
    });

    it('should return INVALID_USERNAME error for long username', async () => {
      const input = { ...validInput, username: 'a'.repeat(21) };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_USERNAME');
        expect(result.error.message).toBe('Username cannot exceed 20 characters');
      }
    });

    it('should return INVALID_USERNAME error for username with invalid characters', async () => {
      const input = { ...validInput, username: 'test@user' };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_USERNAME');
        expect(result.error.message).toBe('Username can only contain letters, numbers, and underscores');
      }
    });

    it('should return INVALID_USERNAME error for empty username', async () => {
      const input = { ...validInput, username: '' };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_USERNAME');
      }
    });

    it('should return USERNAME_EXISTS error for taken username', async () => {
      mockUserRepository.isUsernameAvailable.and.resolveTo(false);

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('USERNAME_EXISTS');
        expect(result.error.message).toBe('Username is already taken');
      }
    });

    it('should return EMAIL_EXISTS error for already registered email', async () => {
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);
      mockAuthPort.signUp.and.rejectWith(new Error('User already registered'));

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMAIL_EXISTS');
        expect(result.error.message).toBe('Email is already registered');
      }
    });

    it('should return EMAIL_EXISTS error for "already exists" message', async () => {
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);
      mockAuthPort.signUp.and.rejectWith(new Error('Email already exists'));

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMAIL_EXISTS');
      }
    });

    it('should return NETWORK_ERROR for other errors', async () => {
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);
      mockAuthPort.signUp.and.rejectWith(new Error('Network failure'));

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Network failure');
      }
    });

    it('should return NETWORK_ERROR with default message for non-Error throws', async () => {
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);
      mockAuthPort.signUp.and.rejectWith('Unknown error');

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Registration failed');
      }
    });

    it('should accept valid username formats', async () => {
      const mockSession = createMockSession();
      mockAuthPort.signUp.and.resolveTo(mockSession);
      mockUserRepository.isUsernameAvailable.and.resolveTo(true);

      const validUsernames = ['abc', 'test_user', 'user123', 'Test_User_123'];

      for (const username of validUsernames) {
        const result = await useCase.execute({ ...validInput, username });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid username formats', async () => {
      const invalidUsernames = ['a b', 'test-user', 'user@name', 'name.test', ''];

      for (const username of invalidUsernames) {
        const result = await useCase.execute({ ...validInput, username });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('INVALID_USERNAME');
        }
      }
    });
  });
});
