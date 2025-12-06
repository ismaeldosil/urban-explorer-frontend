import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Coordinates } from '@core/value-objects/coordinates.vo';

export interface IGeolocationPort {
  getCurrentPosition(): Promise<Coordinates>;
  watchPosition(callback: (position: Coordinates) => void): Promise<string>;
  clearWatch(watchId: string): Promise<void>;
  checkPermissions(): Promise<'granted' | 'denied' | 'prompt'>;
  requestPermissions(): Promise<'granted' | 'denied'>;
}

@Injectable({ providedIn: 'root' })
export class CapacitorGeolocationAdapter implements IGeolocationPort {
  async getCurrentPosition(): Promise<Coordinates> {
    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return Coordinates.create(
      position.coords.latitude,
      position.coords.longitude
    );
  }

  async watchPosition(callback: (position: Coordinates) => void): Promise<string> {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      (position, err) => {
        if (err) {
          console.error('Error watching position:', err);
          return;
        }

        if (position) {
          const coords = Coordinates.create(
            position.coords.latitude,
            position.coords.longitude
          );
          callback(coords);
        }
      }
    );

    return watchId;
  }

  async clearWatch(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
  }

  async checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
    const permission = await Geolocation.checkPermissions();
    return permission.location as 'granted' | 'denied' | 'prompt';
  }

  async requestPermissions(): Promise<'granted' | 'denied'> {
    const permission = await Geolocation.requestPermissions();
    return permission.location === 'granted' ? 'granted' : 'denied';
  }
}
