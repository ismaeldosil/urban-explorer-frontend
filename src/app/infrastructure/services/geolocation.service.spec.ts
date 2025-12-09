import { TestBed } from '@angular/core/testing';
import { GeolocationService } from './geolocation.service';
import {
  IGeolocationPort,
  GeolocationPosition,
  GeolocationError,
} from '@application/ports/geolocation.port';
import { GEOLOCATION_PORT } from '@infrastructure/di/tokens';
import { Result } from '@shared/types/result.type';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationEntity } from '@core/entities/location.entity';

describe('GeolocationService', () => {
  let service: GeolocationService;
  let mockGeolocationPort: jasmine.SpyObj<IGeolocationPort>;

  const createMockPosition = (lat = -34.9011, lng = -56.1645): GeolocationPosition => ({
    coordinates: Coordinates.create(lat, lng),
    accuracy: 10,
    altitude: undefined,
    altitudeAccuracy: undefined,
    heading: undefined,
    speed: undefined,
    timestamp: Date.now(),
  });

  const createMockLocation = (id: string, lat: number, lng: number): LocationEntity => {
    return LocationEntity.create({
      id,
      name: `Location ${id}`,
      description: 'Test location',
      category: 'restaurant',
      coordinates: Coordinates.create(lat, lng),
      address: 'Test address',
      city: 'Montevideo',
      country: 'Uruguay',
      rating: 4.5,
      reviewCount: 10,
      priceLevel: 2,
      images: [],
      createdBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockGeolocationPort = jasmine.createSpyObj('IGeolocationPort', [
      'checkPermissions',
      'requestPermissions',
      'getCurrentPosition',
      'watchPosition',
      'clearWatch',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GeolocationService,
        { provide: GEOLOCATION_PORT, useValue: mockGeolocationPort },
      ],
    });

    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('permission management', () => {
    describe('checkPermissions', () => {
      it('should return granted when permissions are granted', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('granted'));

        const result = await service.checkPermissions();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('granted');
        }
      });

      it('should return denied when permissions are denied', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('denied'));

        const result = await service.checkPermissions();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('denied');
        }
      });

      it('should return prompt when permissions need to be requested', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('prompt'));

        const result = await service.checkPermissions();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('prompt');
        }
      });

      it('should return error when check fails', async () => {
        const error: GeolocationError = { code: 'UNKNOWN', message: 'Check failed' };
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.fail(error));

        const result = await service.checkPermissions();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('UNKNOWN');
        }
      });
    });

    describe('requestPermissions', () => {
      it('should request and return granted status', async () => {
        mockGeolocationPort.requestPermissions.and.resolveTo(Result.ok('granted'));

        const result = await service.requestPermissions();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('granted');
        }
        expect(mockGeolocationPort.requestPermissions).toHaveBeenCalled();
      });

      it('should handle permission denied', async () => {
        mockGeolocationPort.requestPermissions.and.resolveTo(Result.ok('denied'));

        const result = await service.requestPermissions();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('denied');
        }
      });
    });

    describe('hasPermission', () => {
      it('should return true when permission is granted', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('granted'));

        const hasPermission = await service.hasPermission();

        expect(hasPermission).toBe(true);
      });

      it('should return false when permission is denied', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('denied'));

        const hasPermission = await service.hasPermission();

        expect(hasPermission).toBe(false);
      });

      it('should return false when permission needs prompt', async () => {
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.ok('prompt'));

        const hasPermission = await service.hasPermission();

        expect(hasPermission).toBe(false);
      });

      it('should return false on error', async () => {
        const error: GeolocationError = { code: 'UNKNOWN', message: 'Error' };
        mockGeolocationPort.checkPermissions.and.resolveTo(Result.fail(error));

        const hasPermission = await service.hasPermission();

        expect(hasPermission).toBe(false);
      });
    });
  });

  describe('getCurrentPosition', () => {
    it('should return current position when successful', async () => {
      const mockPosition = createMockPosition();
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));

      const result = await service.getCurrentPosition();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.coordinates.latitude).toBe(-34.9011);
        expect(result.data.coordinates.longitude).toBe(-56.1645);
      }
    });

    it('should update currentPosition signal', async () => {
      const mockPosition = createMockPosition();
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));

      await service.getCurrentPosition();

      expect(service.currentPosition()).toEqual(mockPosition);
    });

    it('should return error when position unavailable', async () => {
      const error: GeolocationError = { code: 'POSITION_UNAVAILABLE', message: 'GPS off' };
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.fail(error));

      const result = await service.getCurrentPosition();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('POSITION_UNAVAILABLE');
      }
    });

    it('should return error when permission denied', async () => {
      const error: GeolocationError = { code: 'PERMISSION_DENIED', message: 'Denied' };
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.fail(error));

      const result = await service.getCurrentPosition();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('PERMISSION_DENIED');
      }
    });

    it('should return error on timeout', async () => {
      const error: GeolocationError = { code: 'TIMEOUT', message: 'Timeout' };
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.fail(error));

      const result = await service.getCurrentPosition();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TIMEOUT');
      }
    });

    it('should pass options to port', async () => {
      const mockPosition = createMockPosition();
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));
      const options = { enableHighAccuracy: false, timeout: 5000 };

      await service.getCurrentPosition(options);

      expect(mockGeolocationPort.getCurrentPosition).toHaveBeenCalledWith(options);
    });
  });

  describe('watchPosition', () => {
    it('should start watching and return watch id', async () => {
      mockGeolocationPort.watchPosition.and.resolveTo(Result.ok('watch-123'));

      const result = await service.startWatching();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('watch-123');
      }
      expect(service.isWatching()).toBe(true);
    });

    it('should update currentPosition when position changes', async () => {
      let positionCallback: ((result: Result<GeolocationPosition, GeolocationError>) => void) | null = null;
      mockGeolocationPort.watchPosition.and.callFake((callback) => {
        positionCallback = callback;
        return Promise.resolve(Result.ok('watch-123'));
      });

      await service.startWatching();
      expect(positionCallback).not.toBeNull();

      const newPosition = createMockPosition(-34.91, -56.17);
      positionCallback!(Result.ok(newPosition));

      expect(service.currentPosition()?.coordinates.latitude).toBe(-34.91);
    });

    it('should stop watching correctly', async () => {
      mockGeolocationPort.watchPosition.and.resolveTo(Result.ok('watch-123'));
      mockGeolocationPort.clearWatch.and.resolveTo(Result.ok(undefined));

      await service.startWatching();
      await service.stopWatching();

      expect(mockGeolocationPort.clearWatch).toHaveBeenCalledWith('watch-123');
      expect(service.isWatching()).toBe(false);
    });

    it('should handle watch error', async () => {
      const error: GeolocationError = { code: 'PERMISSION_DENIED', message: 'Denied' };
      mockGeolocationPort.watchPosition.and.resolveTo(Result.fail(error));

      const result = await service.startWatching();

      expect(result.success).toBe(false);
      expect(service.isWatching()).toBe(false);
    });
  });

  describe('distance calculations', () => {
    describe('calculateDistance', () => {
      it('should calculate distance between two points', () => {
        const from = Coordinates.create(-34.9011, -56.1645);
        const to = Coordinates.create(-34.9101, -56.1745);

        const distance = service.calculateDistance(from, to);

        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(2000); // Less than 2km
      });

      it('should return 0 for same coordinates', () => {
        const coords = Coordinates.create(-34.9011, -56.1645);

        const distance = service.calculateDistance(coords, coords);

        expect(distance).toBe(0);
      });
    });

    describe('sortByDistance', () => {
      beforeEach(async () => {
        const mockPosition = createMockPosition(-34.9011, -56.1645);
        mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));
        await service.getCurrentPosition();
      });

      it('should sort locations by distance from current position', () => {
        const locations = [
          createMockLocation('far', -34.95, -56.20),
          createMockLocation('near', -34.905, -56.165),
          createMockLocation('medium', -34.92, -56.18),
        ];

        const sorted = service.sortByDistance(locations);

        expect(sorted[0].id).toBe('near');
        expect(sorted[2].id).toBe('far');
      });

      it('should return empty array for empty input', () => {
        const sorted = service.sortByDistance([]);

        expect(sorted).toEqual([]);
      });

      it('should not modify original array', () => {
        const locations = [
          createMockLocation('1', -34.95, -56.20),
          createMockLocation('2', -34.905, -56.165),
        ];
        const originalOrder = [...locations];

        service.sortByDistance(locations);

        expect(locations[0].id).toBe(originalOrder[0].id);
      });
    });

    describe('getDistanceToLocation', () => {
      beforeEach(async () => {
        const mockPosition = createMockPosition(-34.9011, -56.1645);
        mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));
        await service.getCurrentPosition();
      });

      it('should return distance to a location', () => {
        const location = createMockLocation('1', -34.92, -56.18);

        const distance = service.getDistanceToLocation(location);

        expect(distance).toBeGreaterThan(0);
      });

      it('should return null if no current position', () => {
        const freshService = new GeolocationService(mockGeolocationPort);
        const location = createMockLocation('1', -34.92, -56.18);

        const distance = freshService.getDistanceToLocation(location);

        expect(distance).toBeNull();
      });
    });

    describe('filterByRadius', () => {
      beforeEach(async () => {
        const mockPosition = createMockPosition(-34.9011, -56.1645);
        mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));
        await service.getCurrentPosition();
      });

      it('should filter locations within radius', () => {
        const locations = [
          createMockLocation('near', -34.905, -56.165),    // ~700m
          createMockLocation('far', -34.95, -56.20),       // ~6km
          createMockLocation('medium', -34.91, -56.17),    // ~1.2km
        ];

        const filtered = service.filterByRadius(locations, 1000);

        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('near');
      });

      it('should return all locations if radius is large enough', () => {
        const locations = [
          createMockLocation('1', -34.905, -56.165),
          createMockLocation('2', -34.95, -56.20),
        ];

        const filtered = service.filterByRadius(locations, 50000);

        expect(filtered.length).toBe(2);
      });

      it('should return empty array if no locations within radius', () => {
        const locations = [
          createMockLocation('1', -35.0, -56.3), // Very far
        ];

        const filtered = service.filterByRadius(locations, 100);

        expect(filtered.length).toBe(0);
      });
    });
  });

  describe('getNearbyLocations', () => {
    it('should get current position and filter nearby', async () => {
      const mockPosition = createMockPosition(-34.9011, -56.1645);
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));

      const locations = [
        createMockLocation('near', -34.905, -56.165),
        createMockLocation('far', -34.95, -56.20),
      ];

      const result = await service.getNearbyLocations(locations, 1000);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe('near');
      }
    });

    it('should return error if position fails', async () => {
      const error: GeolocationError = { code: 'PERMISSION_DENIED', message: 'Denied' };
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.fail(error));

      const locations = [createMockLocation('1', -34.905, -56.165)];

      const result = await service.getNearbyLocations(locations, 1000);

      expect(result.success).toBe(false);
    });

    it('should sort by distance', async () => {
      const mockPosition = createMockPosition(-34.9011, -56.1645);
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));

      const locations = [
        createMockLocation('medium', -34.91, -56.17),
        createMockLocation('near', -34.905, -56.165),
        createMockLocation('far', -34.92, -56.18),
      ];

      const result = await service.getNearbyLocations(locations, 5000);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0].id).toBe('near');
        expect(result.data[2].id).toBe('far');
      }
    });
  });

  describe('formatted distance', () => {
    beforeEach(async () => {
      const mockPosition = createMockPosition(-34.9011, -56.1645);
      mockGeolocationPort.getCurrentPosition.and.resolveTo(Result.ok(mockPosition));
      await service.getCurrentPosition();
    });

    it('should format distance in meters when less than 1km', () => {
      const location = createMockLocation('near', -34.905, -56.165);

      const formatted = service.getFormattedDistance(location);

      expect(formatted).toMatch(/^\d+ m$/);
    });

    it('should format distance in km when 1km or more', () => {
      const location = createMockLocation('far', -34.95, -56.20);

      const formatted = service.getFormattedDistance(location);

      expect(formatted).toMatch(/^\d+(\.\d)? km$/);
    });

    it('should return empty string if no current position', () => {
      const freshService = new GeolocationService(mockGeolocationPort);
      const location = createMockLocation('1', -34.92, -56.18);

      const formatted = freshService.getFormattedDistance(location);

      expect(formatted).toBe('');
    });
  });
});
