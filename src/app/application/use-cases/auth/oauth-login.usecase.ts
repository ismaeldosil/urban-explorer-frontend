import { Injectable, Inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { DomainError } from '@core/errors/domain-error';
import { IAuthPort, OAuthProvider } from '../../ports/auth.port';
import { AUTH_PORT } from '@infrastructure/di/tokens';

export interface OAuthLoginInput {
  provider: OAuthProvider;
}

export type OAuthLoginError =
  | { code: 'OAUTH_ERROR'; message: string }
  | { code: 'NETWORK_ERROR'; message: string };

@Injectable({ providedIn: 'root' })
export class OAuthLoginUseCase {
  constructor(
    @Inject(AUTH_PORT) private authPort: IAuthPort
  ) {}

  async execute(input: OAuthLoginInput): Promise<Result<void, OAuthLoginError>> {
    try {
      await this.authPort.signInWithOAuth(input.provider);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail({ code: 'OAUTH_ERROR', message: error.message });
      }

      const message = error instanceof Error ? error.message : 'OAuth login failed';
      return Result.fail({ code: 'NETWORK_ERROR', message });
    }
  }
}
