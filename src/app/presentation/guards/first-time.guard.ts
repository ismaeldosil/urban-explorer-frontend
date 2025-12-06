import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IStoragePort } from '@application/ports/storage.port';
import { STORAGE_PORT } from '@infrastructure/di/tokens';

const FIRST_TIME_KEY = 'hasSeenOnboarding';

export const firstTimeGuard: CanActivateFn = async () => {
  const storage = inject(STORAGE_PORT);
  const router = inject(Router);

  const result = await storage.get<boolean>(FIRST_TIME_KEY);

  if (!result.success || !result.data) {
    // Primera vez, mostrar onboarding
    router.navigate(['/onboarding']);
    return false;
  }

  return true;
};
