import { TestBed } from '@angular/core/testing';
import { GetUserFavoritesUseCase } from './get-user-favorites.usecase';
import { FAVORITE_REPOSITORY } from '@infrastructure/di/tokens';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FavoriteEntity } from '@core/entities/favorite.entity';
import { Result } from '@shared/types/result.type';

describe('GetUserFavoritesUseCase', () => {
  let useCase: GetUserFavoritesUseCase;
  let mockFavoriteRepository: jasmine.SpyObj<IFavoriteRepository>;

  const mockUserId = 'user-123';

  const createMockFavorites = (): FavoriteEntity[] => [
    {
      id: 'fav-1',
      userId: mockUserId,
      locationId: 'location-1',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'fav-2',
      userId: mockUserId,
      locationId: 'location-2',
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'fav-3',
      userId: mockUserId,
      locationId: 'location-3',
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(() => {
    mockFavoriteRepository = jasmine.createSpyObj('IFavoriteRepository', [
      'getByUserId',
      'create',
      'delete',
      'isFavorite',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GetUserFavoritesUseCase,
        { provide: FAVORITE_REPOSITORY, useValue: mockFavoriteRepository },
      ],
    });

    useCase = TestBed.inject(GetUserFavoritesUseCase);
  });

  describe('execute', () => {
    it('should return favorites for a user', async () => {
      const mockFavorites = createMockFavorites();
      mockFavoriteRepository.getByUserId.and.resolveTo(Result.ok(mockFavorites));

      const result = await useCase.execute(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockFavorites);
        expect(result.data.length).toBe(3);
      }
      expect(mockFavoriteRepository.getByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array when user has no favorites', async () => {
      mockFavoriteRepository.getByUserId.and.resolveTo(Result.ok([]));

      const result = await useCase.execute(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
        expect(result.data.length).toBe(0);
      }
    });

    it('should return error when repository fails', async () => {
      const error = new Error('Database connection failed');
      mockFavoriteRepository.getByUserId.and.resolveTo(Result.fail(error));

      const result = await useCase.execute(mockUserId);

      expect(result.success).toBe(false);
    });

    it('should handle thrown exceptions', async () => {
      const error = new Error('Unexpected error');
      mockFavoriteRepository.getByUserId.and.throwError(error);

      const result = await useCase.execute(mockUserId);

      expect(result.success).toBe(false);
    });

    it('should call repository with correct user ID', async () => {
      mockFavoriteRepository.getByUserId.and.resolveTo(Result.ok([]));

      const differentUserId = 'different-user-456';
      await useCase.execute(differentUserId);

      expect(mockFavoriteRepository.getByUserId).toHaveBeenCalledWith(differentUserId);
    });
  });
});
