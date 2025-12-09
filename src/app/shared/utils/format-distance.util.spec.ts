import { formatDistance } from './format-distance.util';

describe('formatDistance', () => {
  describe('distances less than 1 km', () => {
    it('should return meters for distance less than 1 km', () => {
      expect(formatDistance(0.5)).toBe('500m');
    });

    it('should return 100m for 0.1 km', () => {
      expect(formatDistance(0.1)).toBe('100m');
    });

    it('should return 0m for 0 km', () => {
      expect(formatDistance(0)).toBe('0m');
    });

    it('should round meters properly', () => {
      expect(formatDistance(0.123)).toBe('123m');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(0.5555)).toBe('556m');
    });

    it('should handle very small distances', () => {
      expect(formatDistance(0.001)).toBe('1m');
    });

    it('should handle 0.999 km as meters', () => {
      expect(formatDistance(0.999)).toBe('999m');
    });
  });

  describe('distances between 1 and 10 km', () => {
    it('should return km with one decimal for exactly 1 km', () => {
      expect(formatDistance(1)).toBe('1.0km');
    });

    it('should return km with one decimal for 5 km', () => {
      expect(formatDistance(5)).toBe('5.0km');
    });

    it('should return km with one decimal for 2.5 km', () => {
      expect(formatDistance(2.5)).toBe('2.5km');
    });

    it('should round to one decimal place', () => {
      expect(formatDistance(3.456)).toBe('3.5km');
    });

    it('should handle 9.9 km', () => {
      expect(formatDistance(9.9)).toBe('9.9km');
    });

    it('should handle 1.01 km', () => {
      expect(formatDistance(1.01)).toBe('1.0km');
    });
  });

  describe('distances 10 km and above', () => {
    it('should return rounded km for 10 km', () => {
      expect(formatDistance(10)).toBe('10km');
    });

    it('should round to nearest km for 15.5 km', () => {
      expect(formatDistance(15.5)).toBe('16km');
    });

    it('should round to nearest km for 15.4 km', () => {
      expect(formatDistance(15.4)).toBe('15km');
    });

    it('should handle large distances', () => {
      expect(formatDistance(100)).toBe('100km');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(1000)).toBe('1000km');
    });

    it('should round 10.1 to 10 km', () => {
      expect(formatDistance(10.1)).toBe('10km');
    });

    it('should round 10.9 to 11 km', () => {
      expect(formatDistance(10.9)).toBe('11km');
    });
  });

  describe('edge cases', () => {
    it('should handle negative distance (although not realistic)', () => {
      // -1 km = -1000 meters, which is less than 1000m threshold so shows as meters
      expect(formatDistance(-1)).toBe('-1000m');
    });

    it('should handle NaN', () => {
      const result = formatDistance(NaN);
      expect(result).toContain('NaN');
    });

    it('should handle Infinity', () => {
      const result = formatDistance(Infinity);
      expect(result).toContain('Infinity');
    });
  });
});
