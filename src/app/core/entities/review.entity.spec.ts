import { ReviewEntity, ReviewProps } from './review.entity';
import { DomainError } from '../errors/domain-error';

describe('ReviewEntity', () => {
  const now = new Date();

  const createValidProps = (overrides?: Partial<ReviewProps>): ReviewProps => ({
    id: 'review-1',
    locationId: 'location-1',
    userId: 'user-1',
    rating: 4,
    comment: 'This is a test comment that is longer than 50 characters to pass validation.',
    photos: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  describe('create', () => {
    it('should create a valid review entity', () => {
      const review = ReviewEntity.create(createValidProps());

      expect(review.id).toBe('review-1');
      expect(review.locationId).toBe('location-1');
      expect(review.userId).toBe('user-1');
      expect(review.rating).toBe(4);
      expect(review.photos).toEqual([]);
      expect(review.tags).toEqual([]);
      expect(review.createdAt).toBe(now);
      expect(review.updatedAt).toBe(now);
    });

    it('should handle photos array', () => {
      const photos = ['photo1.jpg', 'photo2.jpg'];
      const review = ReviewEntity.create(createValidProps({ photos }));
      expect(review.photos).toEqual(photos);
    });

    it('should handle tags array', () => {
      const tags = ['great', 'cozy'];
      const review = ReviewEntity.create(createValidProps({ tags }));
      expect(review.tags).toEqual(tags);
    });
  });

  describe('rating validation', () => {
    it('should throw error for rating below 1', () => {
      expect(() => ReviewEntity.create(createValidProps({ rating: 0 }))).toThrowError();
    });

    it('should throw error for rating above 5', () => {
      expect(() => ReviewEntity.create(createValidProps({ rating: 6 }))).toThrowError();
    });

    it('should accept rating of 1', () => {
      const review = ReviewEntity.create(createValidProps({ rating: 1 }));
      expect(review.rating).toBe(1);
    });

    it('should accept rating of 5', () => {
      const review = ReviewEntity.create(createValidProps({ rating: 5 }));
      expect(review.rating).toBe(5);
    });

    it('should accept rating in between', () => {
      const review = ReviewEntity.create(createValidProps({ rating: 3 }));
      expect(review.rating).toBe(3);
    });
  });

  describe('comment validation', () => {
    it('should throw error for empty comment', () => {
      expect(() => ReviewEntity.create(createValidProps({ comment: '' }))).toThrowError();
    });

    it('should throw error for comment shorter than 50 characters', () => {
      const shortComment = 'a'.repeat(49);
      expect(() => ReviewEntity.create(createValidProps({ comment: shortComment }))).toThrowError();
    });

    it('should accept comment with exactly 50 characters', () => {
      const comment = 'a'.repeat(50);
      const review = ReviewEntity.create(createValidProps({ comment }));
      expect(review.comment).toBe(comment);
    });

    it('should throw error for comment longer than 500 characters', () => {
      const longComment = 'a'.repeat(501);
      expect(() => ReviewEntity.create(createValidProps({ comment: longComment }))).toThrowError();
    });

    it('should accept comment with exactly 500 characters', () => {
      const comment = 'a'.repeat(500);
      const review = ReviewEntity.create(createValidProps({ comment }));
      expect(review.comment).toBe(comment);
    });
  });

  describe('photos validation', () => {
    it('should throw error for more than 5 photos', () => {
      const photos = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
      expect(() => ReviewEntity.create(createValidProps({ photos }))).toThrowError();
    });

    it('should accept exactly 5 photos', () => {
      const photos = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
      const review = ReviewEntity.create(createValidProps({ photos }));
      expect(review.photos.length).toBe(5);
    });

    it('should accept empty photos array', () => {
      const review = ReviewEntity.create(createValidProps({ photos: [] }));
      expect(review.photos).toEqual([]);
    });
  });

  describe('tags validation', () => {
    it('should throw error for more than 3 tags', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4'];
      expect(() => ReviewEntity.create(createValidProps({ tags }))).toThrowError();
    });

    it('should accept exactly 3 tags', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      const review = ReviewEntity.create(createValidProps({ tags }));
      expect(review.tags.length).toBe(3);
    });

    it('should accept empty tags array', () => {
      const review = ReviewEntity.create(createValidProps({ tags: [] }));
      expect(review.tags).toEqual([]);
    });
  });

  describe('isPositive', () => {
    it('should return true for rating >= 4', () => {
      expect(ReviewEntity.create(createValidProps({ rating: 4 })).isPositive()).toBe(true);
      expect(ReviewEntity.create(createValidProps({ rating: 5 })).isPositive()).toBe(true);
    });

    it('should return false for rating < 4', () => {
      expect(ReviewEntity.create(createValidProps({ rating: 3 })).isPositive()).toBe(false);
      expect(ReviewEntity.create(createValidProps({ rating: 2 })).isPositive()).toBe(false);
      expect(ReviewEntity.create(createValidProps({ rating: 1 })).isPositive()).toBe(false);
    });
  });

  describe('update', () => {
    it('should update comment', () => {
      const review = ReviewEntity.create(createValidProps());
      const newComment = 'This is a new comment that is also longer than 50 characters.';
      const updatedReview = review.update({ comment: newComment });

      expect(updatedReview.comment).toBe(newComment);
      expect(review.comment).not.toBe(newComment); // Original unchanged
    });

    it('should update rating', () => {
      const review = ReviewEntity.create(createValidProps({ rating: 3 }));
      const updatedReview = review.update({ rating: 5 });

      expect(updatedReview.rating).toBe(5);
      expect(review.rating).toBe(3); // Original unchanged
    });

    it('should update both comment and rating', () => {
      const review = ReviewEntity.create(createValidProps());
      const newComment = 'This is a completely new comment with more than fifty characters.';
      const updatedReview = review.update({ comment: newComment, rating: 5 });

      expect(updatedReview.comment).toBe(newComment);
      expect(updatedReview.rating).toBe(5);
    });

    it('should update updatedAt timestamp', () => {
      const review = ReviewEntity.create(createValidProps());
      const updatedReview = review.update({ rating: 5 });

      expect(updatedReview.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it('should preserve other properties when updating', () => {
      const photos = ['photo1.jpg'];
      const tags = ['nice'];
      const review = ReviewEntity.create(createValidProps({ photos, tags }));
      const updatedReview = review.update({ rating: 5 });

      expect(updatedReview.id).toBe(review.id);
      expect(updatedReview.locationId).toBe(review.locationId);
      expect(updatedReview.userId).toBe(review.userId);
      expect(updatedReview.photos).toEqual(photos);
      expect(updatedReview.tags).toEqual(tags);
    });

    it('should return a new ReviewEntity instance', () => {
      const review = ReviewEntity.create(createValidProps());
      const updatedReview = review.update({ rating: 5 });

      expect(updatedReview).not.toBe(review);
    });

    it('should throw error if new rating is invalid', () => {
      const review = ReviewEntity.create(createValidProps());
      expect(() => review.update({ rating: 0 })).toThrowError();
    });

    it('should throw error if new comment is too short', () => {
      const review = ReviewEntity.create(createValidProps());
      expect(() => review.update({ comment: 'Short' })).toThrowError();
    });
  });

  describe('date properties', () => {
    it('should return createdAt and updatedAt', () => {
      const review = ReviewEntity.create(createValidProps());
      expect(review.createdAt).toBe(now);
      expect(review.updatedAt).toBe(now);
    });
  });
});
