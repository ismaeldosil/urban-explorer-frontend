import { LocationMapper } from './location.mapper';
import { LocationEntity } from '@core/entities/location.entity';
import { LocationDto } from '../dtos/location.dto';
import { Coordinates } from '@core/value-objects/coordinates.vo';

describe('LocationMapper', () => {
  const mockLocationDto: LocationDto = {
    id: 'loc-1',
    name: 'Test Location',
    description: 'A great test location',
    latitude: 40.7128,
    longitude: -74.006,
    categoryId: 'cat-1',
    imageUrl: 'https://example.com/image.jpg',
    averageRating: 4.5,
    reviewCount: 100,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-20T15:30:00.000Z',
  };

  const mockLocationEntity = LocationEntity.create({
    id: 'loc-1',
    name: 'Test Location',
    description: 'A great test location',
    category: 'cat-1',
    coordinates: Coordinates.create(40.7128, -74.006),
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    imageUrl: 'https://example.com/image.jpg',
    rating: 4.5,
    reviewCount: 100,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-20T15:30:00.000Z'),
  });

  describe('toEntity', () => {
    it('should convert DTO to entity', () => {
      const result = LocationMapper.toEntity(mockLocationDto);

      expect(result.id).toBe(mockLocationDto.id);
      expect(result.name).toBe(mockLocationDto.name);
      expect(result.description).toBe(mockLocationDto.description);
      expect(result.coordinates.latitude).toBe(mockLocationDto.latitude);
      expect(result.coordinates.longitude).toBe(mockLocationDto.longitude);
      expect(result.category).toBe(mockLocationDto.categoryId);
      expect(result.imageUrl).toBe(mockLocationDto.imageUrl);
      expect(result.rating).toBe(mockLocationDto.averageRating!);
      expect(result.reviewCount).toBe(mockLocationDto.reviewCount);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert date strings to Date objects', () => {
      const result = LocationMapper.toEntity(mockLocationDto);

      expect(result.createdAt.toISOString()).toBe(mockLocationDto.createdAt);
      expect(result.updatedAt.toISOString()).toBe(mockLocationDto.updatedAt);
    });

    it('should handle undefined averageRating', () => {
      const dtoWithoutRating: LocationDto = { ...mockLocationDto, averageRating: undefined };

      const result = LocationMapper.toEntity(dtoWithoutRating);

      expect(result.rating).toBe(0);
    });
  });

  describe('toDto', () => {
    it('should convert entity to DTO', () => {
      const result = LocationMapper.toDto(mockLocationEntity);

      expect(result.id).toBe(mockLocationEntity.id);
      expect(result.name).toBe(mockLocationEntity.name);
      expect(result.description).toBe(mockLocationEntity.description);
      expect(result.latitude).toBe(mockLocationEntity.coordinates.latitude);
      expect(result.longitude).toBe(mockLocationEntity.coordinates.longitude);
      expect(result.categoryId).toBe(mockLocationEntity.category);
      expect(result.imageUrl).toBe(mockLocationEntity.imageUrl);
      expect(result.averageRating).toBe(mockLocationEntity.rating);
      expect(result.reviewCount).toBe(mockLocationEntity.reviewCount);
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should convert Date objects to ISO strings', () => {
      const result = LocationMapper.toDto(mockLocationEntity);

      expect(result.createdAt).toBe(mockLocationEntity.createdAt.toISOString());
      expect(result.updatedAt).toBe(mockLocationEntity.updatedAt.toISOString());
    });
  });

  describe('toDtoArray', () => {
    it('should convert array of entities to DTOs', () => {
      const entity2 = LocationMapper.toEntity({ ...mockLocationDto, id: 'loc-2' });
      const entities = [mockLocationEntity, entity2];

      const result = LocationMapper.toDtoArray(entities);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('loc-1');
      expect(result[1].id).toBe('loc-2');
    });

    it('should return empty array for empty input', () => {
      const result = LocationMapper.toDtoArray([]);

      expect(result).toEqual([]);
    });
  });

  describe('toEntityArray', () => {
    it('should convert array of DTOs to entities', () => {
      const dtos = [mockLocationDto, { ...mockLocationDto, id: 'loc-2' }];

      const result = LocationMapper.toEntityArray(dtos);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('loc-1');
      expect(result[1].id).toBe('loc-2');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[1].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array for empty input', () => {
      const result = LocationMapper.toEntityArray([]);

      expect(result).toEqual([]);
    });
  });
});
