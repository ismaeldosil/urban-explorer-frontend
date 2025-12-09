import { inject } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { ReviewEntity } from '@core/entities/review.entity';
import { IReviewRepository } from '@core/repositories/review.repository';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';

export class CreateReviewUseCase {
  private reviewRepository = inject(REVIEW_REPOSITORY);

  async execute(
    locationId: string,
    userId: string,
    rating: number,
    comment: string,
    photos?: string[],
    tags?: string[]
  ): Promise<Result<ReviewEntity>> {
    try {
      return await this.reviewRepository.create({
        locationId,
        userId,
        rating,
        comment,
        photos: photos ?? [],
        tags: tags ?? [],
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
