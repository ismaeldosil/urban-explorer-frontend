import { LocationEntity } from '@core/entities/location.entity';
import { LocationDto } from '../dtos/location.dto';

export class LocationMapper {
  static toEntity(dto: LocationDto): LocationEntity {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      categoryId: dto.categoryId,
      imageUrl: dto.imageUrl,
      averageRating: dto.averageRating,
      reviewCount: dto.reviewCount,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  static toDto(entity: LocationEntity): LocationDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      latitude: entity.latitude,
      longitude: entity.longitude,
      categoryId: entity.categoryId,
      imageUrl: entity.imageUrl,
      averageRating: entity.averageRating,
      reviewCount: entity.reviewCount,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDtoArray(entities: LocationEntity[]): LocationDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toEntityArray(dtos: LocationDto[]): LocationEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }
}
