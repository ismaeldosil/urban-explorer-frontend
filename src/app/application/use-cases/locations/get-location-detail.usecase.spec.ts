import { TestBed } from '@angular/core/testing';
import { GetLocationDetailUseCase } from './get-location-detail.usecase';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';
import { ILocationRepository } from '@core/repositories/location.repository';
import { LocationEntity } from '@core/entities/location.entity';
import { Coordinates } from '@core/value-objects/coordinates.vo';

describe('GetLocationDetailUseCase', () => {
  let useCase: GetLocationDetailUseCase;
  let mockLocationRepository: jasmine.SpyObj<ILocationRepository>;

  const createMockLocation = (): LocationEntity => {
    return LocationEntity.create({
      id: 'location-123',
      name: 'Test Location',
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
        GetLocationDetailUseCase,
        { provide: LOCATION_REPOSITORY, useValue: mockLocationRepository },
      ],
    });

    useCase = TestBed.inject(GetLocationDetailUseCase);
  });

  describe('execute', () => {
    it('should return location when found', async () => {
      const mockLocation = createMockLocation();
      mockLocationRepository.findById.and.resolveTo(mockLocation);

      const result = await useCase.execute('location-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('location-123');
        expect(result.data.name).toBe('Test Location');
      }
      expect(mockLocationRepository.findById).toHaveBeenCalledWith('location-123');
    });

    it('should return NOT_FOUND error when location does not exist', async () => {
      mockLocationRepository.findById.and.resolveTo(null);

      const result = await useCase.execute('nonexistent-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Location not found');
      }
    });

    it('should return FETCH_FAILED error when repository throws', async () => {
      mockLocationRepository.findById.and.rejectWith(new Error('Database connection failed'));

      const result = await useCase.execute('location-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FETCH_FAILED');
        expect(result.error.message).toBe('Database connection failed');
      }
    });

    it('should return default error message for non-Error throws', async () => {
      mockLocationRepository.findById.and.rejectWith('Unknown error');

      const result = await useCase.execute('location-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FETCH_FAILED');
        expect(result.error.message).toBe('Failed to fetch location');
      }
    });
  });
});
