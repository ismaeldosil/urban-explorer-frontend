import { ReviewEntity } from '../entities/review.entity';
import { Result } from '@shared/types/result.type';

export interface IReviewRepository {
  getByLocationId(locationId: string): Promise<Result<ReviewEntity[]>>;
  getById(id: string): Promise<Result<ReviewEntity | null>>;
  create(review: Omit<ReviewEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<ReviewEntity>>;
  update(id: string, review: Partial<ReviewEntity>): Promise<Result<ReviewEntity>>;
  delete(id: string): Promise<Result<void>>;
}
