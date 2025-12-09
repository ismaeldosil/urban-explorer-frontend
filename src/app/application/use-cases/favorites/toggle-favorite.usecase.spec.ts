import { TestBed } from '@angular/core/testing';
import { ToggleFavoriteUseCase } from './toggle-favorite.usecase';
import { FAVORITE_REPOSITORY } from '@infrastructure/di/tokens';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FavoriteEntity } from '@core/entities/favorite.entity';
import { Result } from '@shared/types/result.type';

describe('ToggleFavoriteUseCase', () => {
  let useCase: ToggleFavoriteUseCase;
  let mockFavoriteRepository: jasmine.SpyObj<IFavoriteRepository>;

  const mockUserId = 'user-123';
  const mockLocationId = 'location-456';

  const createMockFavorite = (): FavoriteEntity => ({
    id: 'favorite-789',
    userId: mockUserId,
    locationId: mockLocationId,
    createdAt: new Date(),
  });

  beforeEach(() => {
    mockFavoriteRepository = jasmine.createSpyObj('IFavoriteRepository', [
      'getByUserId',
      'create',
      'delete',
      'isFavorite',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ToggleFavoriteUseCase,
        { provide: FAVORITE_REPOSITORY, useValue: mockFavoriteRepository },
      ],
    });

    useCase = TestBed.inject(ToggleFavoriteUseCase);
  });

  describe('execute', () => {
    it('should add favorite when location is not already favorited', async () => {
      mockFavoriteRepository.isFavorite.and.resolveTo(Result.ok(false));
      mockFavoriteRepository.create.and.resolveTo(Result.ok(createMockFavorite()));

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true); // true means added to favorites
      }
      expect(mockFavoriteRepository.isFavorite).toHaveBeenCalledWith(mockUserId, mockLocationId);
      expect(mockFavoriteRepository.create).toHaveBeenCalledWith(mockUserId, mockLocationId);
      expect(mockFavoriteRepository.delete).not.toHaveBeenCalled();
    });

    it('should remove favorite when location is already favorited', async () => {
      mockFavoriteRepository.isFavorite.and.resolveTo(Result.ok(true));
      mockFavoriteRepository.delete.and.resolveTo(Result.ok(undefined));

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false); // false means removed from favorites
      }
      expect(mockFavoriteRepository.isFavorite).toHaveBeenCalledWith(mockUserId, mockLocationId);
      expect(mockFavoriteRepository.delete).toHaveBeenCalledWith(mockUserId, mockLocationId);
      expect(mockFavoriteRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when isFavorite check fails', async () => {
      const error = new Error('Database connection failed');
      mockFavoriteRepository.isFavorite.and.resolveTo(Result.fail(error));

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(false);
      expect(mockFavoriteRepository.create).not.toHaveBeenCalled();
      expect(mockFavoriteRepository.delete).not.toHaveBeenCalled();
    });

    it('should return error when create favorite fails', async () => {
      const error = new Error('Failed to create favorite');
      mockFavoriteRepository.isFavorite.and.resolveTo(Result.ok(false));
      mockFavoriteRepository.create.and.resolveTo(Result.fail(error));

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(false);
    });

    it('should return error when delete favorite fails', async () => {
      const error = new Error('Failed to delete favorite');
      mockFavoriteRepository.isFavorite.and.resolveTo(Result.ok(true));
      mockFavoriteRepository.delete.and.resolveTo(Result.fail(error));

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(false);
    });

    it('should handle thrown exceptions', async () => {
      const error = new Error('Unexpected error');
      mockFavoriteRepository.isFavorite.and.throwError(error);

      const result = await useCase.execute(mockUserId, mockLocationId);

      expect(result.success).toBe(false);
    });
  });
});
