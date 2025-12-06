import { DomainError } from '../errors/domain-error';

export class Coordinates {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static create(latitude: number, longitude: number): Coordinates {
    if (!Coordinates.isValid(latitude, longitude)) {
      throw new DomainError('Invalid coordinates', 'INVALID_COORDINATES');
    }
    return new Coordinates(latitude, longitude);
  }

  static isValid(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  distanceTo(other: Coordinates): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (this.latitude * Math.PI) / 180;
    const φ2 = (other.latitude * Math.PI) / 180;
    const Δφ = ((other.latitude - this.latitude) * Math.PI) / 180;
    const Δλ = ((other.longitude - this.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  equals(other: Coordinates): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toJSON(): { latitude: number; longitude: number } {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}
