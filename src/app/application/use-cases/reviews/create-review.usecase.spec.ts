import { TestBed } from '@angular/core/testing';
import { CreateReviewUseCase } from './create-review.usecase';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { IReviewRepository } from '@core/repositories/review.repository';
import { ReviewEntity } from '@core/entities/review.entity';
import { Result } from '@shared/types/result.type';

describe('CreateReviewUseCase', () => {
  let useCase: CreateReviewUseCase;
  let mockReviewRepository: jasmine.SpyObj<IReviewRepository>;

  const mockLocationId = 'location-123';
  const mockUserId = 'user-456';
  // Comment needs to be at least 50 characters
  const validComment = 'This is a great place with amazing atmosphere and delicious food!';

  const createMockReview = (): ReviewEntity => {
    return ReviewEntity.create({
      id: 'review-789',
      locationId: mockLocationId,
      userId: mockUserId,
      rating: 4,
      comment: validComment,
      photos: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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
        CreateReviewUseCase,
        { provide: REVIEW_REPOSITORY, useValue: mockReviewRepository },
      ],
    });

    useCase = TestBed.inject(CreateReviewUseCase);
  });

  describe('execute', () => {
    it('should create a review successfully', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.create.and.resolveTo(Result.ok(mockReview));

      const result = await useCase.execute(
        mockLocationId,
        mockUserId,
        4,
        validComment
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(mockReview);
      }
      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        locationId: mockLocationId,
        userId: mockUserId,
        rating: 4,
        comment: validComment,
        photos: [],
        tags: [],
      });
    });

    it('should create a review with photos', async () => {
      const mockReview = createMockReview();
      const photos = ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'];
      mockReviewRepository.create.and.resolveTo(Result.ok(mockReview));
      const amazingComment = 'Amazing place with incredible views and wonderful service! Highly recommend visiting.';

      const result = await useCase.execute(
        mockLocationId,
        mockUserId,
        5,
        amazingComment,
        photos
      );

      expect(result.success).toBe(true);
      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        locationId: mockLocationId,
        userId: mockUserId,
        rating: 5,
        comment: amazingComment,
        photos,
        tags: [],
      });
    });

    it('should create a review with photos and tags', async () => {
      const mockReview = createMockReview();
      const photos = ['http://example.com/image1.jpg'];
      const tags = ['cozy', 'family-friendly'];
      const perfectComment = 'Perfect experience! Everything was wonderful and exceeded our expectations.';
      mockReviewRepository.create.and.resolveTo(Result.ok(mockReview));

      const result = await useCase.execute(
        mockLocationId,
        mockUserId,
        5,
        perfectComment,
        photos,
        tags
      );

      expect(result.success).toBe(true);
      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        locationId: mockLocationId,
        userId: mockUserId,
        rating: 5,
        comment: perfectComment,
        photos,
        tags,
      });
    });

    it('should return error when repository fails', async () => {
      const error = new Error('Failed to create review');
      mockReviewRepository.create.and.resolveTo(Result.fail(error));

      const result = await useCase.execute(
        mockLocationId,
        mockUserId,
        4,
        validComment
      );

      expect(result.success).toBe(false);
    });

    it('should handle thrown exceptions', async () => {
      const error = new Error('Unexpected error');
      mockReviewRepository.create.and.throwError(error);

      const result = await useCase.execute(
        mockLocationId,
        mockUserId,
        4,
        validComment
      );

      expect(result.success).toBe(false);
    });

    it('should pass all parameters correctly to repository', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.create.and.resolveTo(Result.ok(mockReview));
      const okayComment = 'It was okay, nothing special but not bad either. Average experience overall.';

      await useCase.execute(
        'loc-abc',
        'user-xyz',
        3,
        okayComment,
        ['img1.jpg'],
        ['tag1']
      );

      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        locationId: 'loc-abc',
        userId: 'user-xyz',
        rating: 3,
        comment: okayComment,
        photos: ['img1.jpg'],
        tags: ['tag1'],
      });
    });
  });
});
