import { TestBed } from '@angular/core/testing';
import { GetNearbyLocationsUseCase, GetNearbyLocationsParams } from './get-nearby-locations.usecase';
import { LOCATION_REPOSITORY } from '@infrastructure/di/tokens';
import { ILocationRepository } from '@core/repositories/location.repository';
import { LocationEntity } from '@core/entities/location.entity';
import { Coordinates } from '@core/value-objects/coordinates.vo';

describe('GetNearbyLocationsUseCase', () => {
  let useCase: GetNearbyLocationsUseCase;
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
        GetNearbyLocationsUseCase,
        { provide: LOCATION_REPOSITORY, useValue: mockLocationRepository },
      ],
    });

    useCase = TestBed.inject(GetNearbyLocationsUseCase);
  });

  describe('execute', () => {
    it('should return nearby locations', async () => {
      const mockLocations = [
        createMockLocation('loc-1', 'Nearby Place 1'),
        createMockLocation('loc-2', 'Nearby Place 2'),
      ];
      mockLocationRepository.findNearby.and.resolveTo(mockLocations);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = await useCase.execute(params);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Nearby Place 1');
    });

    it('should use default radius of 5km', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      await useCase.execute(params);

      const call = mockLocationRepository.findNearby.calls.first();
      expect(call.args[1]).toBe(5);
    });

    it('should use default limit of 50', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      await useCase.execute(params);

      const call = mockLocationRepository.findNearby.calls.first();
      expect(call.args[2]).toBe(50);
    });

    it('should use custom radius when provided', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
        radiusKm: 10,
      };
      await useCase.execute(params);

      const call = mockLocationRepository.findNearby.calls.first();
      expect(call.args[1]).toBe(10);
    });

    it('should use custom limit when provided', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
        limit: 25,
      };
      await useCase.execute(params);

      const call = mockLocationRepository.findNearby.calls.first();
      expect(call.args[2]).toBe(25);
    });

    it('should create valid Coordinates object', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      await useCase.execute(params);

      const call = mockLocationRepository.findNearby.calls.first();
      const coordinates = call.args[0] as Coordinates;
      expect(coordinates.latitude).toBe(40.7128);
      expect(coordinates.longitude).toBe(-74.006);
    });

    it('should return empty array when no locations found', async () => {
      mockLocationRepository.findNearby.and.resolveTo([]);

      const params: GetNearbyLocationsParams = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = await useCase.execute(params);

      expect(result).toEqual([]);
    });
  });
});
