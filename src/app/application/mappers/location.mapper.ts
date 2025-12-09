import { LocationEntity } from '@core/entities/location.entity';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationDto } from '../dtos/location.dto';

export class LocationMapper {
  static toEntity(dto: LocationDto): LocationEntity {
    return LocationEntity.create({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      category: dto.categoryId,
      coordinates: Coordinates.create(dto.latitude, dto.longitude),
      address: '',
      city: '',
      country: '',
      imageUrl: dto.imageUrl,
      rating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount,
      createdBy: '',
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toDto(entity: LocationEntity): LocationDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      latitude: entity.coordinates.latitude,
      longitude: entity.coordinates.longitude,
      categoryId: entity.category,
      imageUrl: entity.imageUrl,
      averageRating: entity.rating,
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
