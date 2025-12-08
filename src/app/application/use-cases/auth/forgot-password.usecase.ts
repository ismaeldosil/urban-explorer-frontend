import { Injectable, Inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { Email } from '@core/value-objects/email.vo';
import { IAuthPort } from '../../ports/auth.port';
import { AUTH_PORT } from '@infrastructure/di/tokens';

export interface ForgotPasswordInput {
  email: string;
}

export type ForgotPasswordError =
  | { code: 'INVALID_EMAIL'; message: string }
  | { code: 'NETWORK_ERROR'; message: string };

@Injectable({ providedIn: 'root' })
export class ForgotPasswordUseCase {
  constructor(
    @Inject(AUTH_PORT) private authPort: IAuthPort
  ) {}

  async execute(input: ForgotPasswordInput): Promise<Result<void, ForgotPasswordError>> {
    try {
      // Validate email
      if (!Email.isValid(input.email)) {
        return Result.fail({ code: 'INVALID_EMAIL', message: 'Invalid email format' });
      }

      // Always return success for security (don't reveal if email exists)
      await this.authPort.resetPassword(input.email);

      return Result.ok(undefined);
    } catch (error) {
      // Still return success for security
      return Result.ok(undefined);
    }
  }
}
