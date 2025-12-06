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

export interface IReviewRepository {
  getByLocationId(locationId: string): Promise<Result<ReviewEntity[]>>;
  getById(id: string): Promise<Result<ReviewEntity | null>>;
  getByUserId(userId: string, limit?: number): Promise<Result<ReviewEntity[]>>;
  create(review: CreateReviewInput): Promise<Result<ReviewEntity>>;
  update(id: string, review: UpdateReviewInput): Promise<Result<ReviewEntity>>;
  delete(id: string): Promise<Result<void>>;
}
