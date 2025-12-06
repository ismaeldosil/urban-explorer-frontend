import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  isUsernameAvailable?(username: string): Promise<boolean>;
}
