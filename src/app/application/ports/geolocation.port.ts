import { Result } from '@shared/types/result.type';
import { Coordinates } from '@core/value-objects/coordinates.vo';

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

export interface GeolocationPosition {
  coordinates: Coordinates;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

export interface IGeolocationPort {
  checkPermissions(): Promise<Result<PermissionStatus, GeolocationError>>;
  requestPermissions(): Promise<Result<PermissionStatus, GeolocationError>>;
  getCurrentPosition(options?: GeolocationOptions): Promise<Result<GeolocationPosition, GeolocationError>>;
  watchPosition(
    callback: (result: Result<GeolocationPosition, GeolocationError>) => void,
    options?: GeolocationOptions
  ): Promise<Result<string, GeolocationError>>;
  clearWatch(watchId: string): Promise<Result<void, GeolocationError>>;
}
