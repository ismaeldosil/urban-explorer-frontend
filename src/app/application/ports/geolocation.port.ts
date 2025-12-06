import { Result } from '@shared/types/result.type';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface IGeolocationPort {
  getCurrentPosition(): Promise<Result<GeolocationPosition>>;
  watchPosition(callback: (position: GeolocationPosition) => void): Promise<Result<string>>;
  clearWatch(watchId: string): Promise<Result<void>>;
}
