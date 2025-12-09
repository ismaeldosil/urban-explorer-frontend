import { Coordinates } from './coordinates.vo';
import { DomainError } from '../errors/domain-error';

describe('Coordinates', () => {
  describe('create', () => {
    it('should create valid coordinates', () => {
      const coords = Coordinates.create(40.7128, -74.006);

      expect(coords.latitude).toBe(40.7128);
      expect(coords.longitude).toBe(-74.006);
    });

    it('should throw error for invalid latitude above 90', () => {
      expect(() => Coordinates.create(91, 0)).toThrowError(DomainError);
    });

    it('should throw error for invalid latitude below -90', () => {
      expect(() => Coordinates.create(-91, 0)).toThrowError(DomainError);
    });

    it('should throw error for invalid longitude above 180', () => {
      expect(() => Coordinates.create(0, 181)).toThrowError(DomainError);
    });

    it('should throw error for invalid longitude below -180', () => {
      expect(() => Coordinates.create(0, -181)).toThrowError(DomainError);
    });

    it('should accept boundary values', () => {
      expect(() => Coordinates.create(90, 180)).not.toThrow();
      expect(() => Coordinates.create(-90, -180)).not.toThrow();
      expect(() => Coordinates.create(0, 0)).not.toThrow();
    });
  });

  describe('isValid', () => {
    it('should return true for valid coordinates', () => {
      expect(Coordinates.isValid(40.7128, -74.006)).toBe(true);
      expect(Coordinates.isValid(0, 0)).toBe(true);
      expect(Coordinates.isValid(90, 180)).toBe(true);
      expect(Coordinates.isValid(-90, -180)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      expect(Coordinates.isValid(91, 0)).toBe(false);
      expect(Coordinates.isValid(-91, 0)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      expect(Coordinates.isValid(0, 181)).toBe(false);
      expect(Coordinates.isValid(0, -181)).toBe(false);
    });
  });

  describe('distanceTo', () => {
    it('should return 0 for same coordinates', () => {
      const coords = Coordinates.create(40.7128, -74.006);
      const distance = coords.distanceTo(coords);

      expect(distance).toBe(0);
    });

    it('should calculate distance between two points correctly', () => {
      const nyc = Coordinates.create(40.7128, -74.006);
      const la = Coordinates.create(34.0522, -118.2437);
      const distance = nyc.distanceTo(la);

      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should calculate short distances accurately', () => {
      const point1 = Coordinates.create(40, 0);
      const point2 = Coordinates.create(41, 0);
      const distance = point1.distanceTo(point2);

      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });
  });

  describe('equals', () => {
    it('should return true for same coordinates', () => {
      const coords1 = Coordinates.create(40.7128, -74.006);
      const coords2 = Coordinates.create(40.7128, -74.006);

      expect(coords1.equals(coords2)).toBe(true);
    });

    it('should return false for different coordinates', () => {
      const coords1 = Coordinates.create(40.7128, -74.006);
      const coords2 = Coordinates.create(34.0522, -118.2437);

      expect(coords1.equals(coords2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const coords = Coordinates.create(40.7128, -74.006);
      const json = coords.toJSON();

      expect(json).toEqual({ latitude: 40.7128, longitude: -74.006 });
    });
  });
});
