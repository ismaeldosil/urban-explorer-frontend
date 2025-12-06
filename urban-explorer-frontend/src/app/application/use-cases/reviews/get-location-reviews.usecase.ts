import { inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { ReviewEntity } from '@core/entities/review.entity';
import { IReviewRepository } from '@core/repositories/review.repository';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';

export class GetLocationReviewsUseCase {
  private reviewRepository = inject(REVIEW_REPOSITORY);

  async execute(locationId: string): Promise<Result<ReviewEntity[]>> {
    try {
      return await this.reviewRepository.getByLocationId(locationId);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
