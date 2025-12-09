import { LocationEntity, LocationProps } from './location.entity';
import { Coordinates } from '../value-objects/coordinates.vo';
import { DomainError } from '../errors/domain-error';

describe('LocationEntity', () => {
  const validCoordinates = Coordinates.create(40.7128, -74.006);
  const now = new Date();

  const createValidProps = (overrides?: Partial<LocationProps>): LocationProps => ({
    id: '1',
    name: 'Test Location',
    description: 'A test location description',
    category: 'restaurant',
    coordinates: validCoordinates,
    address: '123 Test Street',
    city: 'New York',
    country: 'USA',
    rating: 4.5,
    createdBy: 'user-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  describe('create', () => {
    it('should create a valid location entity', () => {
      const location = LocationEntity.create(createValidProps());

      expect(location.id).toBe('1');
      expect(location.name).toBe('Test Location');
      expect(location.description).toBe('A test location description');
      expect(location.category).toBe('restaurant');
      expect(location.address).toBe('123 Test Street');
      expect(location.city).toBe('New York');
      expect(location.country).toBe('USA');
      expect(location.rating).toBe(4.5);
      expect(location.createdBy).toBe('user-1');
    });

    it('should throw error for name shorter than 2 characters', () => {
      expect(() => LocationEntity.create(createValidProps({ name: 'A' }))).toThrowError();
    });

    it('should throw error for empty name', () => {
      expect(() => LocationEntity.create(createValidProps({ name: '' }))).toThrowError();
    });

    it('should accept name with exactly 2 characters', () => {
      const location = LocationEntity.create(createValidProps({ name: 'AB' }));
      expect(location.name).toBe('AB');
    });
  });

  describe('optional properties', () => {
    it('should handle undefined imageUrl', () => {
      const location = LocationEntity.create(createValidProps({ imageUrl: undefined }));
      expect(location.imageUrl).toBeUndefined();
    });

    it('should handle imageUrl when provided', () => {
      const location = LocationEntity.create(createValidProps({ imageUrl: 'https://example.com/image.jpg' }));
      expect(location.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should return empty array for undefined images', () => {
      const location = LocationEntity.create(createValidProps({ images: undefined }));
      expect(location.images).toEqual([]);
    });

    it('should return images array when provided', () => {
      const images = ['img1.jpg', 'img2.jpg'];
      const location = LocationEntity.create(createValidProps({ images }));
      expect(location.images).toEqual(images);
    });

    it('should return 0 for undefined reviewCount', () => {
      const location = LocationEntity.create(createValidProps({ reviewCount: undefined }));
      expect(location.reviewCount).toBe(0);
    });

    it('should return reviewCount when provided', () => {
      const location = LocationEntity.create(createValidProps({ reviewCount: 100 }));
      expect(location.reviewCount).toBe(100);
    });

    it('should handle undefined priceLevel', () => {
      const location = LocationEntity.create(createValidProps({ priceLevel: undefined }));
      expect(location.priceLevel).toBeUndefined();
    });

    it('should handle priceLevel when provided', () => {
      const location = LocationEntity.create(createValidProps({ priceLevel: 3 }));
      expect(location.priceLevel).toBe(3);
    });

    it('should handle undefined phone', () => {
      const location = LocationEntity.create(createValidProps({ phone: undefined }));
      expect(location.phone).toBeUndefined();
    });

    it('should handle phone when provided', () => {
      const location = LocationEntity.create(createValidProps({ phone: '+1234567890' }));
      expect(location.phone).toBe('+1234567890');
    });

    it('should handle undefined website', () => {
      const location = LocationEntity.create(createValidProps({ website: undefined }));
      expect(location.website).toBeUndefined();
    });

    it('should handle website when provided', () => {
      const location = LocationEntity.create(createValidProps({ website: 'https://example.com' }));
      expect(location.website).toBe('https://example.com');
    });

    it('should return empty array for undefined amenities', () => {
      const location = LocationEntity.create(createValidProps({ amenities: undefined }));
      expect(location.amenities).toEqual([]);
    });

    it('should return amenities array when provided', () => {
      const amenities = ['wifi', 'parking'];
      const location = LocationEntity.create(createValidProps({ amenities }));
      expect(location.amenities).toEqual(amenities);
    });

    it('should return empty array for undefined tags', () => {
      const location = LocationEntity.create(createValidProps({ tags: undefined }));
      expect(location.tags).toEqual([]);
    });

    it('should return tags array when provided', () => {
      const tags = ['italian', 'pizza'];
      const location = LocationEntity.create(createValidProps({ tags }));
      expect(location.tags).toEqual(tags);
    });
  });

  describe('isNear', () => {
    it('should return true when location is within radius', () => {
      const location = LocationEntity.create(createValidProps());
      const nearbyCoords = Coordinates.create(40.7129, -74.006); // Very close
      expect(location.isNear(nearbyCoords, 1000)).toBe(true);
    });

    it('should return false when location is outside radius', () => {
      const location = LocationEntity.create(createValidProps());
      const farCoords = Coordinates.create(41.0, -74.006); // ~32km away
      expect(location.isNear(farCoords, 1000)).toBe(false);
    });

    it('should return true for same coordinates', () => {
      const location = LocationEntity.create(createValidProps());
      expect(location.isNear(validCoordinates, 1)).toBe(true);
    });
  });

  describe('distanceTo', () => {
    it('should return 0 for same coordinates', () => {
      const location = LocationEntity.create(createValidProps());
      const distance = location.distanceTo(validCoordinates);
      expect(distance).toBeCloseTo(0, 0);
    });

    it('should calculate distance to another point', () => {
      const location = LocationEntity.create(createValidProps());
      const otherCoords = Coordinates.create(40.7138, -74.006); // ~111m north
      const distance = location.distanceTo(otherCoords);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200); // Less than 200m
    });
  });

  describe('hasHighRating', () => {
    it('should return true for rating >= 4.0', () => {
      expect(LocationEntity.create(createValidProps({ rating: 4.0 })).hasHighRating()).toBe(true);
      expect(LocationEntity.create(createValidProps({ rating: 4.5 })).hasHighRating()).toBe(true);
      expect(LocationEntity.create(createValidProps({ rating: 5.0 })).hasHighRating()).toBe(true);
    });

    it('should return false for rating < 4.0', () => {
      expect(LocationEntity.create(createValidProps({ rating: 3.9 })).hasHighRating()).toBe(false);
      expect(LocationEntity.create(createValidProps({ rating: 3.0 })).hasHighRating()).toBe(false);
      expect(LocationEntity.create(createValidProps({ rating: 0 })).hasHighRating()).toBe(false);
    });
  });

  describe('coordinates getter', () => {
    it('should return the coordinates', () => {
      const location = LocationEntity.create(createValidProps());
      expect(location.coordinates).toBe(validCoordinates);
    });
  });

  describe('date properties', () => {
    it('should return createdAt and updatedAt', () => {
      const location = LocationEntity.create(createValidProps());
      expect(location.createdAt).toBe(now);
      expect(location.updatedAt).toBe(now);
    });
  });
});
