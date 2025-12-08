import { FavoriteEntity } from '../entities/favorite.entity';
import { Result } from '@shared/types/result.type';

export interface IFavoriteRepository {
  getByUserId(userId: string): Promise<Result<FavoriteEntity[]>>;
  create(userId: string, locationId: string): Promise<Result<FavoriteEntity>>;
  delete(userId: string, locationId: string): Promise<Result<void>>;
  isFavorite(userId: string, locationId: string): Promise<Result<boolean>>;
}
