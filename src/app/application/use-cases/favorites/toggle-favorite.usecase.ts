import { inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FAVORITE_REPOSITORY } from '@infrastructure/di/tokens';

export class ToggleFavoriteUseCase {
  private favoriteRepository = inject(FAVORITE_REPOSITORY);

  async execute(userId: string, locationId: string): Promise<Result<boolean>> {
    try {
      const isFavoriteResult = await this.favoriteRepository.isFavorite(userId, locationId);

      if (!isFavoriteResult.success) {
        return Result.fail(isFavoriteResult.error);
      }

      if (isFavoriteResult.data) {
        const deleteResult = await this.favoriteRepository.delete(userId, locationId);
        if (!deleteResult.success) {
          return Result.fail(deleteResult.error);
        }
        return Result.ok(false);
      } else {
        const createResult = await this.favoriteRepository.create(userId, locationId);
        if (!createResult.success) {
          return Result.fail(createResult.error);
        }
        return Result.ok(true);
      }
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
