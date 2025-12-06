import { Injectable, Inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { Email } from '@core/value-objects/email.vo';
import { Password } from '@core/value-objects/password.vo';
import { DomainError } from '@core/errors/domain-error';
import { IAuthPort, AuthSession } from '../../ports/auth.port';
import { AUTH_PORT } from '@infrastructure/di/tokens';

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginOutput = AuthSession;

export type LoginError =
  | { code: 'INVALID_EMAIL'; message: string }
  | { code: 'INVALID_PASSWORD'; message: string }
  | { code: 'INVALID_CREDENTIALS'; message: string }
  | { code: 'NETWORK_ERROR'; message: string };

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  constructor(
    @Inject(AUTH_PORT) private authPort: IAuthPort
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput, LoginError>> {
    try {
      // Validate email
      if (!Email.isValid(input.email)) {
        return Result.fail({ code: 'INVALID_EMAIL', message: 'Invalid email format' });
      }

      // Validate password is not empty
      if (!input.password || input.password.length < 1) {
        return Result.fail({ code: 'INVALID_PASSWORD', message: 'Password is required' });
      }

      // Attempt login
      const session = await this.authPort.signIn({
        email: input.email,
        password: input.password,
      });

      return Result.ok(session);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail({ code: 'INVALID_CREDENTIALS', message: error.message });
      }

      const message = error instanceof Error ? error.message : 'Login failed';

      if (message.includes('Invalid login credentials')) {
        return Result.fail({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      }

      return Result.fail({ code: 'NETWORK_ERROR', message });
    }
  }
}
