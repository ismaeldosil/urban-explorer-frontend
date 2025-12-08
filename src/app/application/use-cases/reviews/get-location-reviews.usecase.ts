import { inject, Injectable } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { ReviewEntity } from '@core/entities/review.entity';
import {
  IReviewRepository,
  GetReviewsOptions,
  PaginatedResult,
} from '@core/repositories/review.repository';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';

export interface GetLocationReviewsInput {
  locationId: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class GetLocationReviewsUseCase {
  private reviewRepository = inject(REVIEW_REPOSITORY);

  async execute(input: GetLocationReviewsInput): Promise<Result<PaginatedResult<ReviewEntity>>> {
    try {
      const options: GetReviewsOptions = {
        limit: input.limit,
        offset: input.offset,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
      };
      return await this.reviewRepository.getByLocationId(input.locationId, options);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
