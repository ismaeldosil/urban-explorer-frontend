import { Rating } from '../value-objects/rating.vo';
import { DomainError } from '../errors/domain-error';

export interface ReviewProps {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  photos: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewEntity {
  private constructor(private props: ReviewProps) {}

  static create(props: ReviewProps): ReviewEntity {
    if (props.rating < 1 || props.rating > 5) {
      throw new DomainError('Rating must be between 1 and 5', 'INVALID_RATING');
    }
    if (!props.comment || props.comment.length < 50) {
      throw new DomainError('Comment must be at least 50 characters', 'INVALID_COMMENT');
    }
    if (props.comment.length > 500) {
      throw new DomainError('Comment cannot exceed 500 characters', 'INVALID_COMMENT');
    }
    if (props.photos.length > 5) {
      throw new DomainError('Maximum 5 photos allowed', 'TOO_MANY_PHOTOS');
    }
    if (props.tags.length > 3) {
      throw new DomainError('Maximum 3 tags allowed', 'TOO_MANY_TAGS');
    }

    return new ReviewEntity(props);
  }

  get id(): string { return this.props.id; }
  get locationId(): string { return this.props.locationId; }
  get userId(): string { return this.props.userId; }
  get rating(): number { return this.props.rating; }
  get comment(): string { return this.props.comment; }
  get photos(): string[] { return this.props.photos; }
  get tags(): string[] { return this.props.tags; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isPositive(): boolean {
    return this.rating >= 4;
  }

  update(updates: { comment?: string; rating?: number }): ReviewEntity {
    return ReviewEntity.create({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }
}
