import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthStateService } from '@infrastructure/services/auth-state.service';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;
  let mockAuthStateService: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    waitForInitialization: jasmine.Spy<() => Promise<void>>;
  };

  beforeEach(() => {
    isAuthenticatedSignal = signal(false);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    mockAuthStateService = {
      isAuthenticated: isAuthenticatedSignal,
      waitForInitialization: jasmine.createSpy('waitForInitialization').and.resolveTo(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: mockAuthStateService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(true);
    });

    it('should return true and allow access', async () => {
      const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should wait for initialization', async () => {
      await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(mockAuthStateService.waitForInitialization).toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(false);
    });

    it('should return false and navigate to login', async () => {
      const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should wait for initialization before checking', async () => {
      await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(mockAuthStateService.waitForInitialization).toHaveBeenCalled();
    });

    it('should protect multiple routes', async () => {
      const result1 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      const result2 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle authentication state changing from false to true', async () => {
      isAuthenticatedSignal.set(false);
      const result1 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      isAuthenticatedSignal.set(true);
      const result2 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result1).toBe(false);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication state changing from true to false', async () => {
      isAuthenticatedSignal.set(true);
      const result1 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      isAuthenticatedSignal.set(false);
      const result2 = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('async behavior', () => {
    it('should return a promise', () => {
      isAuthenticatedSignal.set(true);

      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle concurrent guard executions', async () => {
      isAuthenticatedSignal.set(true);

      const results = await Promise.all([
        TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)),
        TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)),
        TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)),
      ]);

      expect(results).toEqual([true, true, true]);
    });
  });
});
