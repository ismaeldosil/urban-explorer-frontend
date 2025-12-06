import { Injectable, Inject } from '@angular/core';
import { LocationEntity } from '@core/entities/location.entity';
import { ILocationRepository, SearchFilters } from '@core/repositories/location.repository';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';

export interface SearchLocationsInput {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

export type SearchLocationsError =
  | { code: 'QUERY_TOO_SHORT'; message: string }
  | { code: 'SEARCH_FAILED'; message: string };

export type SearchLocationsResult =
  | { success: true; data: LocationEntity[] }
  | { success: false; error: SearchLocationsError };

@Injectable({ providedIn: 'root' })
export class SearchLocationsUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private locationRepository: ILocationRepository
  ) {}

  async execute(input: SearchLocationsInput): Promise<SearchLocationsResult> {
    try {
      // Validate query length
      if (!input.query || input.query.trim().length < 2) {
        return {
          success: false,
          error: {
            code: 'QUERY_TOO_SHORT',
            message: 'Search query must be at least 2 characters'
          }
        };
      }

      const locations = await this.locationRepository.search(
        input.query.trim(),
        input.filters,
        input.limit ? { page: 1, perPage: input.limit } : undefined
      );

      return { success: true, data: locations };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      return {
        success: false,
        error: { code: 'SEARCH_FAILED', message }
      };
    }
  }
}
