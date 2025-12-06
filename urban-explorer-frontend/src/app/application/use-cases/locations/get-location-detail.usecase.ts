import { Injectable, Inject } from '@angular/core';
import { LocationEntity } from '@core/entities/location.entity';
import { ILocationRepository } from '@core/repositories/location.repository';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';

export type GetLocationDetailError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'FETCH_FAILED'; message: string };

export type GetLocationDetailResult =
  | { success: true; data: LocationEntity }
  | { success: false; error: GetLocationDetailError };

@Injectable({ providedIn: 'root' })
export class GetLocationDetailUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private locationRepository: ILocationRepository
  ) {}

  async execute(locationId: string): Promise<GetLocationDetailResult> {
    try {
      const location = await this.locationRepository.findById(locationId);

      if (!location) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Location not found' }
        };
      }

      return { success: true, data: location };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch location';
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message }
      };
    }
  }
}
