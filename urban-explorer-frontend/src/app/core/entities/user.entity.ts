import { Email } from '../value-objects/email.vo';
import { DomainError } from '../errors/domain-error';

export interface UserProps {
  id: string;
  email: Email;
  username: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
}

export class UserEntity {
  private constructor(private props: UserProps) {}

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }): UserEntity {
    if (!props.username || props.username.length < 3) {
      throw new DomainError('Username must be at least 3 characters', 'INVALID_USERNAME');
    }
    if (props.username.length > 20) {
      throw new DomainError('Username cannot exceed 20 characters', 'INVALID_USERNAME');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(props.username)) {
      throw new DomainError('Username can only contain letters, numbers, and underscores', 'INVALID_USERNAME');
    }

    return new UserEntity({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get username(): string { return this.props.username; }
  get avatarUrl(): string | undefined { return this.props.avatarUrl; }
  get bio(): string | undefined { return this.props.bio; }
  get location(): string | undefined { return this.props.location; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get emailVerified(): boolean { return this.props.emailVerified; }

  updateProfile(updates: { username?: string; bio?: string; location?: string; avatarUrl?: string }): UserEntity {
    return UserEntity.create({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }

  getInitials(): string {
    return this.username.substring(0, 2).toUpperCase();
  }
}
