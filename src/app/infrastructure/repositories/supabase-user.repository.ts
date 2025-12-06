import { Injectable } from '@angular/core';
import { IUserRepository } from '@core/repositories/user.repository';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';
import { SupabaseService } from '../services/supabase.service';
import { DomainError } from '@core/errors/domain-error';

@Injectable({ providedIn: 'root' })
export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    if (!data) return null;

    return UserEntity.create({
      id: data.id,
      email: Email.create(data.email),
      username: data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    if (!data) return null;

    return UserEntity.create({
      id: data.id,
      email: Email.create(data.email),
      username: data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    if (!data) return null;

    return UserEntity.create({
      id: data.id,
      email: Email.create(data.email),
      username: data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const userData = {
      id: user.id,
      email: user.email.value,
      username: user.username,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      email_verified: user.emailVerified,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('profiles')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return UserEntity.create({
      id: data.id,
      email: Email.create(data.email),
      username: data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        username: user.username,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return UserEntity.create({
      id: data.id,
      email: Email.create(data.email),
      username: data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      location: data.location,
      emailVerified: data.email_verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }
  }

  async exists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return !!data;
  }
}
