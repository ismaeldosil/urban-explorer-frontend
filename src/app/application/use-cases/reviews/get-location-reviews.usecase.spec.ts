import { TestBed } from '@angular/core/testing';
import { GetLocationReviewsUseCase, GetLocationReviewsInput } from './get-location-reviews.usecase';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { IReviewRepository, PaginatedResult } from '@core/repositories/review.repository';
import { ReviewEntity } from '@core/entities/review.entity';
import { Result } from '@shared/types/result.type';

describe('GetLocationReviewsUseCase', () => {
  let useCase: GetLocationReviewsUseCase;
  let mockReviewRepository: jasmine.SpyObj<IReviewRepository>;

  const createMockReview = (id: string): ReviewEntity => {
    return ReviewEntity.create({
      id,
      locationId: 'location-123',
      userId: 'user-456',
      rating: 4,
      comment: 'This is a great place! I really enjoyed my visit and would recommend it to everyone.',
      photos: ['photo1.jpg'],
      tags: ['food', 'atmosphere'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const createMockPaginatedResult = (reviews: ReviewEntity[]): Result<PaginatedResult<ReviewEntity>> => {
    return Result.ok({
      data: reviews,
      totalCount: reviews.length,
      hasMore: false,
    });
  };

  beforeEach(() => {
    mockReviewRepository = jasmine.createSpyObj('IReviewRepository', [
      'getByLocationId',
      'getById',
      'getByUserId',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GetLocationReviewsUseCase,
        { provide: REVIEW_REPOSITORY, useValue: mockReviewRepository },
      ],
    });

    useCase = TestBed.inject(GetLocationReviewsUseCase);
  });

  describe('execute', () => {
    it('should return reviews when found', async () => {
      const mockReviews = [createMockReview('review-1'), createMockReview('review-2')];
      mockReviewRepository.getByLocationId.and.resolveTo(createMockPaginatedResult(mockReviews));

      const input: GetLocationReviewsInput = { locationId: 'location-123' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(2);
        expect(result.data.totalCount).toBe(2);
      }
      expect(mockReviewRepository.getByLocationId).toHaveBeenCalledWith('location-123', {
        limit: undefined,
        offset: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
    });

    it('should pass pagination options to repository', async () => {
      mockReviewRepository.getByLocationId.and.resolveTo(createMockPaginatedResult([]));

      const input: GetLocationReviewsInput = {
        locationId: 'location-123',
        limit: 10,
        offset: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      };
      await useCase.execute(input);

      expect(mockReviewRepository.getByLocationId).toHaveBeenCalledWith('location-123', {
        limit: 10,
        offset: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      });
    });

    it('should return empty array when no reviews exist', async () => {
      mockReviewRepository.getByLocationId.and.resolveTo(createMockPaginatedResult([]));

      const input: GetLocationReviewsInput = { locationId: 'location-123' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(0);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should return error when repository fails', async () => {
      mockReviewRepository.getByLocationId.and.resolveTo(
        Result.fail(new Error('Database error'))
      );

      const input: GetLocationReviewsInput = { locationId: 'location-123' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
    });

    it('should handle repository exception', async () => {
      mockReviewRepository.getByLocationId.and.rejectWith(new Error('Network error'));

      const input: GetLocationReviewsInput = { locationId: 'location-123' };
      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
    });

    it('should sort by rating when specified', async () => {
      mockReviewRepository.getByLocationId.and.resolveTo(createMockPaginatedResult([]));

      const input: GetLocationReviewsInput = {
        locationId: 'location-123',
        sortBy: 'rating',
        sortOrder: 'asc',
      };
      await useCase.execute(input);

      expect(mockReviewRepository.getByLocationId).toHaveBeenCalledWith('location-123', {
        limit: undefined,
        offset: undefined,
        sortBy: 'rating',
        sortOrder: 'asc',
      });
    });
  });
});
