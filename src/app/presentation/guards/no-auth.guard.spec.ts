import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { noAuthGuard } from './no-auth.guard';
import { AuthStateService } from '@infrastructure/services/auth-state.service';

describe('noAuthGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isAuthenticatedSignal = signal(false);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: isAuthenticatedSignal,
          },
        },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(false);
    });

    it('should return true and allow access', async () => {
      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow access to login page for guests', async () => {
      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(true);
    });

    it('should allow access to registration page for guests', async () => {
      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle multiple consecutive calls', async () => {
      const result1 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));
      const result2 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(true);
    });

    it('should return false and navigate to explore page', async () => {
      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/explore']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to the correct explore path', async () => {
      await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/explore']);
    });

    it('should redirect logged-in users from login page', async () => {
      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle multiple consecutive denials', async () => {
      const result1 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));
      const result2 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle authentication state changing from true to false', async () => {
      isAuthenticatedSignal.set(true);
      const result1 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      isAuthenticatedSignal.set(false);
      const result2 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result1).toBe(false);
      expect(result2).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication state changing from false to true', async () => {
      isAuthenticatedSignal.set(false);
      const result1 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      isAuthenticatedSignal.set(true);
      const result2 = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should work even if router navigation fails', async () => {
      isAuthenticatedSignal.set(true);
      mockRouter.navigate.and.returnValue(Promise.reject(new Error('Navigation failed')));

      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });

  describe('async behavior', () => {
    it('should return a promise', () => {
      isAuthenticatedSignal.set(false);

      const result = TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle concurrent guard executions', async () => {
      isAuthenticatedSignal.set(false);

      const results = await Promise.all([
        TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any)),
        TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any)),
        TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any)),
      ]);

      expect(results).toEqual([true, true, true]);
    });
  });

  describe('integration with dependency injection', () => {
    it('should properly inject Router when authenticated', async () => {
      isAuthenticatedSignal.set(true);

      await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });

  describe('navigation behavior', () => {
    it('should only navigate when authenticated', async () => {
      isAuthenticatedSignal.set(false);

      await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should use navigate with correct parameters structure', async () => {
      isAuthenticatedSignal.set(true);

      await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/explore']);
    });
  });

  describe('use case scenarios', () => {
    it('should allow guest users to access login page', async () => {
      isAuthenticatedSignal.set(false);

      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should redirect logged-in users trying to access login page', async () => {
      isAuthenticatedSignal.set(true);

      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/explore']);
    });

    it('should allow guest users to access registration page', async () => {
      isAuthenticatedSignal.set(false);

      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(true);
    });

    it('should redirect logged-in users trying to access registration page', async () => {
      isAuthenticatedSignal.set(true);

      const result = await TestBed.runInInjectionContext(() => noAuthGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/explore']);
    });
  });
});
