import { ReviewEntity } from '@core/entities/review.entity';
import { ReviewDto } from '../dtos/review.dto';

export class ReviewMapper {
  static toEntity(dto: ReviewDto): ReviewEntity {
    return {
      id: dto.id,
      locationId: dto.locationId,
      userId: dto.userId,
      rating: dto.rating,
      comment: dto.comment,
      imageUrls: dto.imageUrls,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  static toDto(entity: ReviewEntity): ReviewDto {
    return {
      id: entity.id,
      locationId: entity.locationId,
      userId: entity.userId,
      rating: entity.rating,
      comment: entity.comment,
      imageUrls: entity.imageUrls,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDtoArray(entities: ReviewEntity[]): ReviewDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toEntityArray(dtos: ReviewDto[]): ReviewEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }
}
