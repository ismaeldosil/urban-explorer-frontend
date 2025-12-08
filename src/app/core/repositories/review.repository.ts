import { ReviewEntity } from '../entities/review.entity';
import { Result } from '@shared/types/result.type';

export interface CreateReviewInput {
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  photos: string[];
  tags: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  photos?: string[];
  tags?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
}

export interface GetReviewsOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface IReviewRepository {
  getByLocationId(locationId: string, options?: GetReviewsOptions): Promise<Result<PaginatedResult<ReviewEntity>>>;
  getById(id: string): Promise<Result<ReviewEntity | null>>;
  getByUserId(userId: string, options?: GetReviewsOptions): Promise<Result<PaginatedResult<ReviewEntity>>>;
  create(review: CreateReviewInput): Promise<Result<ReviewEntity>>;
  update(id: string, review: UpdateReviewInput): Promise<Result<ReviewEntity>>;
  delete(id: string): Promise<Result<void>>;
}
