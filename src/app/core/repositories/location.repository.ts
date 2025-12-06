import { LocationEntity } from '../entities/location.entity';
import { Coordinates } from '../value-objects/coordinates.vo';

export interface SearchFilters {
  categoryId?: string;
  minRating?: number;
  maxPriceLevel?: number;
  amenities?: string[];
  openNow?: boolean;
}

export interface PaginationOptions {
  page: number;
  perPage: number;
}

export interface ILocationRepository {
  findById(id: string): Promise<LocationEntity | null>;
  findNearby(coordinates: Coordinates, radiusKm: number, limit?: number): Promise<LocationEntity[]>;
  findByCategory(category: string, limit?: number): Promise<LocationEntity[]>;
  search(query: string, filters?: SearchFilters, pagination?: PaginationOptions): Promise<LocationEntity[]>;
  save(location: LocationEntity): Promise<LocationEntity>;
  update(id: string, data: Partial<LocationEntity>): Promise<LocationEntity>;
  delete(id: string): Promise<void>;
}
