import { Injectable, Inject, signal, computed } from '@angular/core';
import {
  IGeolocationPort,
  GeolocationPosition,
  GeolocationOptions,
  GeolocationError,
  PermissionStatus,
} from '@application/ports/geolocation.port';
import { GEOLOCATION_PORT } from '@infrastructure/di/tokens';
import { Result } from '@shared/types/result.type';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationEntity } from '@core/entities/location.entity';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly _currentPosition = signal<GeolocationPosition | null>(null);
  private readonly _isWatching = signal(false);
  private _watchId: string | null = null;

  readonly currentPosition = this._currentPosition.asReadonly();
  readonly isWatching = this._isWatching.asReadonly();

  readonly currentCoordinates = computed(() => {
    const position = this._currentPosition();
    return position?.coordinates ?? null;
  });

  constructor(
    @Inject(GEOLOCATION_PORT) private readonly geolocationPort: IGeolocationPort
  ) {}

  async checkPermissions(): Promise<Result<PermissionStatus, GeolocationError>> {
    return this.geolocationPort.checkPermissions();
  }

  async requestPermissions(): Promise<Result<PermissionStatus, GeolocationError>> {
    return this.geolocationPort.requestPermissions();
  }

  async hasPermission(): Promise<boolean> {
    const result = await this.checkPermissions();
    return result.success && result.data === 'granted';
  }

  async getCurrentPosition(
    options?: GeolocationOptions
  ): Promise<Result<GeolocationPosition, GeolocationError>> {
    const result = await this.geolocationPort.getCurrentPosition(options);
    if (result.success) {
      this._currentPosition.set(result.data);
    }
    return result;
  }

  async startWatching(
    options?: GeolocationOptions
  ): Promise<Result<string, GeolocationError>> {
    if (this._isWatching()) {
      await this.stopWatching();
    }

    const result = await this.geolocationPort.watchPosition(
      (positionResult) => {
        if (positionResult.success) {
          this._currentPosition.set(positionResult.data);
        }
      },
      options
    );

    if (result.success) {
      this._watchId = result.data;
      this._isWatching.set(true);
    }

    return result;
  }

  async stopWatching(): Promise<Result<void, GeolocationError>> {
    if (!this._watchId) {
      return Result.ok(undefined);
    }

    const result = await this.geolocationPort.clearWatch(this._watchId);
    this._watchId = null;
    this._isWatching.set(false);
    return result;
  }

  calculateDistance(from: Coordinates, to: Coordinates): number {
    return from.distanceTo(to);
  }

  sortByDistance(locations: LocationEntity[]): LocationEntity[] {
    const currentPos = this._currentPosition();
    if (!currentPos || locations.length === 0) {
      return [...locations];
    }

    return [...locations].sort((a, b) => {
      const distA = this.calculateDistance(currentPos.coordinates, a.coordinates);
      const distB = this.calculateDistance(currentPos.coordinates, b.coordinates);
      return distA - distB;
    });
  }

  getDistanceToLocation(location: LocationEntity): number | null {
    const currentPos = this._currentPosition();
    if (!currentPos) {
      return null;
    }
    return this.calculateDistance(currentPos.coordinates, location.coordinates);
  }

  filterByRadius(locations: LocationEntity[], radiusMeters: number): LocationEntity[] {
    const currentPos = this._currentPosition();
    if (!currentPos) {
      return [];
    }

    return locations.filter((location) => {
      const distance = this.calculateDistance(currentPos.coordinates, location.coordinates);
      return distance <= radiusMeters;
    });
  }

  async getNearbyLocations(
    locations: LocationEntity[],
    radiusMeters: number
  ): Promise<Result<LocationEntity[], GeolocationError>> {
    const positionResult = await this.getCurrentPosition();
    if (!positionResult.success) {
      return Result.fail(positionResult.error);
    }

    const filtered = this.filterByRadius(locations, radiusMeters);
    const sorted = this.sortByDistance(filtered);
    return Result.ok(sorted);
  }

  getFormattedDistance(location: LocationEntity): string {
    const distance = this.getDistanceToLocation(location);
    if (distance === null) {
      return '';
    }

    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }

    const km = distance / 1000;
    if (km < 10) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km)} km`;
  }
}
