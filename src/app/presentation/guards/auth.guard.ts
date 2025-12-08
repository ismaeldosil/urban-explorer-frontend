import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../infrastructure/services/auth-state.service';

/**
 * Guard that protects routes requiring authentication.
 * Waits for session restoration before checking auth state.
 */
export const authGuard: CanActivateFn = async () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  // Wait for auth state to be initialized (session restoration)
  await authState.waitForInitialization();

  if (authState.isAuthenticated()) {
    return true;
  }

  // Store return URL and redirect to login
  router.navigate(['/auth/login']);
  return false;
};

/**
 * Guard that protects routes that should only be accessible when NOT authenticated.
 * Used for login/register pages to redirect authenticated users.
 */
export const noAuthGuard: CanActivateFn = async () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  // Wait for auth state to be initialized (session restoration)
  await authState.waitForInitialization();

  if (!authState.isAuthenticated()) {
    return true;
  }

  router.navigate(['/tabs/explore']);
  return false;
};
