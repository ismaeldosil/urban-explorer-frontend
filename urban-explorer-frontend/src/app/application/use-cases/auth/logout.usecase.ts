import { Injectable, Inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { IAuthPort } from '../../ports/auth.port';
import { AUTH_PORT } from '@infrastructure/di/tokens';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_PORT) private authPort: IAuthPort
  ) {}

  async execute(): Promise<Result<void, { code: string; message: string }>> {
    try {
      await this.authPort.signOut();
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return Result.fail({ code: 'LOGOUT_ERROR', message });
    }
  }
}
