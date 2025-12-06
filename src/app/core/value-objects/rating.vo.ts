import { DomainError } from '../errors/domain-error';

export class Rating {
  private constructor(
    public readonly value: number,
    public readonly count: number
  ) {}

  static create(value: number, count: number = 0): Rating {
    if (value < 0 || value > 5) {
      throw new DomainError('Rating must be between 0 and 5', 'INVALID_RATING');
    }
    if (count < 0) {
      throw new DomainError('Count cannot be negative', 'INVALID_COUNT');
    }
    return new Rating(Math.round(value * 10) / 10, count);
  }

  static empty(): Rating {
    return new Rating(0, 0);
  }

  addRating(newRating: number): Rating {
    if (newRating < 1 || newRating > 5) {
      throw new DomainError('New rating must be between 1 and 5');
    }
    const newCount = this.count + 1;
    const newValue = ((this.value * this.count) + newRating) / newCount;
    return Rating.create(newValue, newCount);
  }

  isHighRated(): boolean {
    return this.value >= 4.0;
  }

  toJSON(): { value: number; count: number } {
    return { value: this.value, count: this.count };
  }
}
