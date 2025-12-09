import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus as CapPermissionStatus } from '@capacitor/geolocation';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { Result } from '@shared/types/result.type';
import {
  IGeolocationPort,
  GeolocationPosition,
  GeolocationOptions,
  GeolocationError,
  PermissionStatus,
} from '@application/ports/geolocation.port';

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

@Injectable({ providedIn: 'root' })
export class CapacitorGeolocationAdapter implements IGeolocationPort {
  async checkPermissions(): Promise<Result<PermissionStatus, GeolocationError>> {
    try {
      const permission: CapPermissionStatus = await Geolocation.checkPermissions();
      return Result.ok(this.mapPermissionStatus(permission.location));
    } catch (error) {
      return Result.fail(this.mapError(error));
    }
  }

  async requestPermissions(): Promise<Result<PermissionStatus, GeolocationError>> {
    try {
      const permission: CapPermissionStatus = await Geolocation.requestPermissions();
      return Result.ok(this.mapPermissionStatus(permission.location));
    } catch (error) {
      return Result.fail(this.mapError(error));
    }
  }

  async getCurrentPosition(
    options: GeolocationOptions = {}
  ): Promise<Result<GeolocationPosition, GeolocationError>> {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const position: Position = await Geolocation.getCurrentPosition(mergedOptions);
      return Result.ok(this.mapPosition(position));
    } catch (error) {
      return Result.fail(this.mapError(error));
    }
  }

  async watchPosition(
    callback: (result: Result<GeolocationPosition, GeolocationError>) => void,
    options: GeolocationOptions = {}
  ): Promise<Result<string, GeolocationError>> {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const watchId = await Geolocation.watchPosition(mergedOptions, (position, err) => {
        if (err) {
          callback(Result.fail(this.mapError(err)));
          return;
        }
        if (position) {
          callback(Result.ok(this.mapPosition(position)));
        }
      });
      return Result.ok(watchId);
    } catch (error) {
      return Result.fail(this.mapError(error));
    }
  }

  async clearWatch(watchId: string): Promise<Result<void, GeolocationError>> {
    try {
      await Geolocation.clearWatch({ id: watchId });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(this.mapError(error));
    }
  }

  private mapPosition(position: Position): GeolocationPosition {
    return {
      coordinates: Coordinates.create(
        position.coords.latitude,
        position.coords.longitude
      ),
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude ?? undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
      heading: position.coords.heading ?? undefined,
      speed: position.coords.speed ?? undefined,
      timestamp: position.timestamp,
    };
  }

  private mapPermissionStatus(status: string): PermissionStatus {
    switch (status) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      default:
        return 'prompt';
    }
  }

  private mapError(error: unknown): GeolocationError {
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          return { code: 'PERMISSION_DENIED', message: error.message };
        case GeolocationPositionError.POSITION_UNAVAILABLE:
          return { code: 'POSITION_UNAVAILABLE', message: error.message };
        case GeolocationPositionError.TIMEOUT:
          return { code: 'TIMEOUT', message: error.message };
      }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const msg = (error as { message: string }).message;
      if (msg.toLowerCase().includes('permission')) {
        return { code: 'PERMISSION_DENIED', message: msg };
      }
      if (msg.toLowerCase().includes('timeout')) {
        return { code: 'TIMEOUT', message: msg };
      }
      if (msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('position')) {
        return { code: 'POSITION_UNAVAILABLE', message: msg };
      }
      return { code: 'UNKNOWN', message: msg };
    }

    return { code: 'UNKNOWN', message: 'An unknown geolocation error occurred' };
  }
}
