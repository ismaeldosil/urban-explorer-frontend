import { UserEntity } from '@core/entities/user.entity';
import { UserDto } from '../dtos/user.dto';

export class UserMapper {
  static toEntity(dto: UserDto): UserEntity {
    return {
      id: dto.id,
      email: dto.email,
      username: dto.username,
      avatarUrl: dto.avatarUrl,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  static toDto(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username,
      avatarUrl: entity.avatarUrl,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDtoArray(entities: UserEntity[]): UserDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toEntityArray(dtos: UserDto[]): UserEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }
}
