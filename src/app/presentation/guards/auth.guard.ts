import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../infrastructure/services/auth-state.service';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  // Store return URL and redirect to login
  router.navigate(['/auth/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return true;
  }

  router.navigate(['/tabs/explore']);
  return false;
};
