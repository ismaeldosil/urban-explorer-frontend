import { TestBed } from '@angular/core/testing';
import { SearchLocationsUseCase, SearchLocationsInput } from './search-locations.usecase';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';
import { ILocationRepository } from '@core/repositories/location.repository';
import { LocationEntity } from '@core/entities/location.entity';
import { Coordinates } from '@core/value-objects/coordinates.vo';

describe('SearchLocationsUseCase', () => {
  let useCase: SearchLocationsUseCase;
  let mockLocationRepository: jasmine.SpyObj<ILocationRepository>;

  const createMockLocation = (id: string, name: string): LocationEntity => {
    return LocationEntity.create({
      id,
      name,
      description: 'A test location description',
      category: 'restaurant',
      coordinates: Coordinates.create(40.7128, -74.006),
      address: '123 Test St',
      city: 'New York',
      country: 'USA',
      rating: 4.5,
      reviewCount: 100,
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockLocationRepository = jasmine.createSpyObj('ILocationRepository', [
      'findById',
      'findNearby',
      'findByCategory',
      'search',
      'save',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SearchLocationsUseCase,
        { provide: LOCATION_REPOSITORY, useValue: mockLocationRepository },
      ],
    });

    useCase = TestBed.inject(SearchLocationsUseCase);
  });

  describe('execute', () => {
    it('should return locations when search succeeds', async () => {
      const mockLocations = [
        createMockLocation('loc-1', 'Pizza Place'),
        createMockLocation('loc-2', 'Pizza House'),
      ];
      mockLocationRepository.search.and.resolveTo(mockLocations);

      const input: SearchLocationsInput = { query: 'pizza' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
        expect(result.data[0].name).toBe('Pizza Place');
      }
      expect(mockLocationRepository.search).toHaveBeenCalledWith('pizza', undefined, undefined);
    });

    it('should return QUERY_TOO_SHORT error for empty query', async () => {
      const input: SearchLocationsInput = { query: '' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('QUERY_TOO_SHORT');
        expect(result.error.message).toBe('Search query must be at least 2 characters');
      }
      expect(mockLocationRepository.search).not.toHaveBeenCalled();
    });

    it('should return QUERY_TOO_SHORT error for single character query', async () => {
      const input: SearchLocationsInput = { query: 'a' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('QUERY_TOO_SHORT');
      }
    });

    it('should return QUERY_TOO_SHORT error for whitespace-only query', async () => {
      const input: SearchLocationsInput = { query: '   ' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('QUERY_TOO_SHORT');
      }
    });

    it('should trim query before searching', async () => {
      mockLocationRepository.search.and.resolveTo([]);

      const input: SearchLocationsInput = { query: '  pizza  ' };
      await useCase.execute(input);

      expect(mockLocationRepository.search).toHaveBeenCalledWith('pizza', undefined, undefined);
    });

    it('should pass filters to repository', async () => {
      mockLocationRepository.search.and.resolveTo([]);

      const input: SearchLocationsInput = {
        query: 'pizza',
        filters: { categoryId: 'restaurant', minRating: 4 },
      };
      await useCase.execute(input);

      expect(mockLocationRepository.search).toHaveBeenCalledWith(
        'pizza',
        { categoryId: 'restaurant', minRating: 4 },
        undefined
      );
    });

    it('should pass pagination with limit', async () => {
      mockLocationRepository.search.and.resolveTo([]);

      const input: SearchLocationsInput = { query: 'pizza', limit: 10 };
      await useCase.execute(input);

      expect(mockLocationRepository.search).toHaveBeenCalledWith(
        'pizza',
        undefined,
        { page: 1, perPage: 10 }
      );
    });

    it('should return SEARCH_FAILED error when repository throws', async () => {
      mockLocationRepository.search.and.rejectWith(new Error('Search service unavailable'));

      const input: SearchLocationsInput = { query: 'pizza' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SEARCH_FAILED');
        expect(result.error.message).toBe('Search service unavailable');
      }
    });

    it('should return default error message for non-Error throws', async () => {
      mockLocationRepository.search.and.rejectWith('Unknown error');

      const input: SearchLocationsInput = { query: 'pizza' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SEARCH_FAILED');
        expect(result.error.message).toBe('Search failed');
      }
    });

    it('should accept minimum valid query length', async () => {
      mockLocationRepository.search.and.resolveTo([]);

      const input: SearchLocationsInput = { query: 'ab' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockLocationRepository.search).toHaveBeenCalled();
    });
  });
});
