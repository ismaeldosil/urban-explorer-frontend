import { inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { FavoriteEntity } from '@core/entities/favorite.entity';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FAVORITE_REPOSITORY } from '@infrastructure/di/tokens';

export class GetUserFavoritesUseCase {
  private favoriteRepository = inject(FAVORITE_REPOSITORY);

  async execute(userId: string): Promise<Result<FavoriteEntity[]>> {
    try {
      return await this.favoriteRepository.getByUserId(userId);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
