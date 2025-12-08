import { inject, Injectable } from '@angular/core';
import { LocationEntity } from '@core/entities/location.entity';
import { ILocationRepository } from '@core/repositories/location.repository';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';

export interface GetNearbyLocationsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class GetNearbyLocationsUseCase {
  private readonly locationRepository = inject(LOCATION_REPOSITORY) as ILocationRepository;

  async execute(params: GetNearbyLocationsParams): Promise<LocationEntity[]> {
    const { latitude, longitude, radiusKm = 5, limit = 50 } = params;

    const coordinates = Coordinates.create(latitude, longitude);

    return await this.locationRepository.findNearby(coordinates, radiusKm, limit);
  }
}
