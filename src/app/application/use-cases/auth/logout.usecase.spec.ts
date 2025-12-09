import { TestBed } from '@angular/core/testing';
import { LogoutUseCase } from './logout.usecase';
import { AUTH_PORT } from '@infrastructure/di/tokens';
import { IAuthPort } from '../../ports/auth.port';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockAuthPort: jasmine.SpyObj<IAuthPort>;

  beforeEach(() => {
    mockAuthPort = jasmine.createSpyObj('IAuthPort', ['signIn', 'signUp', 'signOut', 'getSession']);

    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        { provide: AUTH_PORT, useValue: mockAuthPort },
      ],
    });

    useCase = TestBed.inject(LogoutUseCase);
  });

  describe('execute', () => {
    it('should return success result on successful logout', async () => {
      mockAuthPort.signOut.and.resolveTo();

      const result = await useCase.execute();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
      expect(mockAuthPort.signOut).toHaveBeenCalled();
    });

    it('should return error result on logout failure', async () => {
      mockAuthPort.signOut.and.rejectWith(new Error('Session expired'));

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('LOGOUT_ERROR');
        expect(result.error.message).toBe('Session expired');
      }
    });

    it('should return default message for non-Error throws', async () => {
      mockAuthPort.signOut.and.rejectWith('Unknown error');

      const result = await useCase.execute();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('LOGOUT_ERROR');
        expect(result.error.message).toBe('Logout failed');
      }
    });

    it('should call signOut on auth port', async () => {
      mockAuthPort.signOut.and.resolveTo();

      await useCase.execute();

      expect(mockAuthPort.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
