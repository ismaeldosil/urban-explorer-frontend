import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '@infrastructure/services/auth-state.service';

export const noAuthGuard: CanActivateFn = async () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const isAuthenticated = await authState.isAuthenticated();

  if (isAuthenticated) {
    router.navigate(['/tabs/explore']);
    return false;
  }

  return true;
};
