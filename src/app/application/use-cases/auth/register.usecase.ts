import { Injectable, Inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { Email } from '@core/value-objects/email.vo';
import { Password } from '@core/value-objects/password.vo';
import { DomainError } from '@core/errors/domain-error';
import { IAuthPort, AuthSession } from '../../ports/auth.port';
import { IUserRepository } from '@core/repositories/user.repository';
import { AUTH_PORT, USER_REPOSITORY } from '@infrastructure/di/tokens';

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export type RegisterOutput = AuthSession;

export type RegisterError =
  | { code: 'INVALID_EMAIL'; message: string }
  | { code: 'INVALID_PASSWORD'; message: string }
  | { code: 'INVALID_USERNAME'; message: string }
  | { code: 'EMAIL_EXISTS'; message: string }
  | { code: 'USERNAME_EXISTS'; message: string }
  | { code: 'NETWORK_ERROR'; message: string };

@Injectable({ providedIn: 'root' })
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_PORT) private authPort: IAuthPort,
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository
  ) {}

  async execute(input: RegisterInput): Promise<Result<RegisterOutput, RegisterError>> {
    try {
      // Validate email
      if (!Email.isValid(input.email)) {
        return Result.fail({ code: 'INVALID_EMAIL', message: 'Invalid email format' });
      }

      // Validate password
      const passwordValidation = Password.validate(input.password);
      if (!passwordValidation.isValid) {
        return Result.fail({
          code: 'INVALID_PASSWORD',
          message: passwordValidation.errors[0]
        });
      }

      // Validate username
      if (!input.username || input.username.length < 3) {
        return Result.fail({
          code: 'INVALID_USERNAME',
          message: 'Username must be at least 3 characters'
        });
      }
      if (input.username.length > 20) {
        return Result.fail({
          code: 'INVALID_USERNAME',
          message: 'Username cannot exceed 20 characters'
        });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(input.username)) {
        return Result.fail({
          code: 'INVALID_USERNAME',
          message: 'Username can only contain letters, numbers, and underscores'
        });
      }

      // Check if username is available
      if (this.userRepository.isUsernameAvailable) {
        const isAvailable = await this.userRepository.isUsernameAvailable(input.username);
        if (!isAvailable) {
          return Result.fail({
            code: 'USERNAME_EXISTS',
            message: 'Username is already taken'
          });
        }
      }

      // Attempt registration
      const session = await this.authPort.signUp({
        email: input.email,
        password: input.password,
        username: input.username,
      });

      return Result.ok(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';

      if (message.includes('already registered') || message.includes('already exists')) {
        return Result.fail({ code: 'EMAIL_EXISTS', message: 'Email is already registered' });
      }

      return Result.fail({ code: 'NETWORK_ERROR', message });
    }
  }
}
