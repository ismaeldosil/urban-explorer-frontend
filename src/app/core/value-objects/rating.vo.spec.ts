import { Rating } from './rating.vo';
import { DomainError } from '../errors/domain-error';

describe('Rating', () => {
  describe('create', () => {
    it('should create valid rating', () => {
      const rating = Rating.create(4.5, 100);

      expect(rating.value).toBe(4.5);
      expect(rating.count).toBe(100);
    });

    it('should round value to one decimal place', () => {
      const rating = Rating.create(4.567, 10);

      expect(rating.value).toBe(4.6);
    });

    it('should accept 0 rating', () => {
      const rating = Rating.create(0, 0);

      expect(rating.value).toBe(0);
    });

    it('should accept 5 rating', () => {
      const rating = Rating.create(5, 10);

      expect(rating.value).toBe(5);
    });

    it('should throw error for rating below 0', () => {
      expect(() => Rating.create(-1, 0)).toThrowError(DomainError);
    });

    it('should throw error for rating above 5', () => {
      expect(() => Rating.create(5.1, 0)).toThrowError(DomainError);
    });

    it('should throw error for negative count', () => {
      expect(() => Rating.create(4, -1)).toThrowError(DomainError);
    });

    it('should default count to 0 if not provided', () => {
      const rating = Rating.create(4.5);

      expect(rating.count).toBe(0);
    });
  });

  describe('empty', () => {
    it('should create empty rating with 0 value and 0 count', () => {
      const rating = Rating.empty();

      expect(rating.value).toBe(0);
      expect(rating.count).toBe(0);
    });
  });

  describe('addRating', () => {
    it('should add first rating correctly', () => {
      const rating = Rating.empty();
      const newRating = rating.addRating(4);

      expect(newRating.value).toBe(4);
      expect(newRating.count).toBe(1);
    });

    it('should calculate average correctly', () => {
      const rating = Rating.create(4, 1);
      const newRating = rating.addRating(5);

      expect(newRating.value).toBe(4.5);
      expect(newRating.count).toBe(2);
    });

    it('should throw error for rating below 1', () => {
      const rating = Rating.create(4, 10);

      expect(() => rating.addRating(0)).toThrowError(DomainError);
    });

    it('should throw error for rating above 5', () => {
      const rating = Rating.create(4, 10);

      expect(() => rating.addRating(6)).toThrowError(DomainError);
    });

    it('should return new Rating instance', () => {
      const rating = Rating.create(4, 10);
      const newRating = rating.addRating(5);

      expect(rating).not.toBe(newRating);
      expect(rating.value).toBe(4);
      expect(rating.count).toBe(10);
    });
  });

  describe('isHighRated', () => {
    it('should return true for rating >= 4', () => {
      expect(Rating.create(4, 1).isHighRated()).toBe(true);
      expect(Rating.create(4.5, 1).isHighRated()).toBe(true);
      expect(Rating.create(5, 1).isHighRated()).toBe(true);
    });

    it('should return false for rating < 4', () => {
      expect(Rating.create(3.9, 1).isHighRated()).toBe(false);
      expect(Rating.create(3, 1).isHighRated()).toBe(false);
      expect(Rating.create(0, 1).isHighRated()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const rating = Rating.create(4.5, 100);
      const json = rating.toJSON();

      expect(json).toEqual({ value: 4.5, count: 100 });
    });
  });
});
