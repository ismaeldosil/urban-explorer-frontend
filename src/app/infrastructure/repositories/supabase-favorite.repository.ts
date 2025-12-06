import { Injectable } from '@angular/core';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FavoriteEntity } from '@core/entities/favorite.entity';
import { SupabaseService } from '../services/supabase.service';
import { DomainError } from '@core/errors/domain-error';

export type FavoriteResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export interface FavoriteWithLocation extends FavoriteEntity {
  location: {
    id: string;
    name: string;
    description: string;
    category: string;
    category_name?: string;
    imageUrl?: string;
    photos?: string[];
    rating: number;
    review_count?: number;
    price_level?: number;
    address: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SupabaseFavoriteRepository implements IFavoriteRepository {
  constructor(private supabase: SupabaseService) {}

  async getByUserId(userId: string): Promise<FavoriteResult<FavoriteEntity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: new DomainError(error.message, 'REPOSITORY_ERROR') };
      }

      const favorites = (data || []).map(item => this.mapToEntity(item));
      return { success: true, data: favorites };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async create(userId: string, locationId: string): Promise<FavoriteResult<FavoriteEntity>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .insert({
          user_id: userId,
          location_id: locationId
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: new DomainError(error.message, 'REPOSITORY_ERROR') };
      }

      return { success: true, data: this.mapToEntity(data) };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async delete(userId: string, locationId: string): Promise<FavoriteResult<void>> {
    try {
      const { error } = await this.supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('location_id', locationId);

      if (error) {
        return { success: false, error: new DomainError(error.message, 'REPOSITORY_ERROR') };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async isFavorite(userId: string, locationId: string): Promise<FavoriteResult<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('location_id', locationId)
        .maybeSingle();

      if (error) {
        return { success: false, error: new DomainError(error.message, 'REPOSITORY_ERROR') };
      }

      return { success: true, data: !!data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private mapToEntity(data: any): FavoriteEntity {
    return {
      id: data.id,
      userId: data.user_id,
      locationId: data.location_id,
      createdAt: new Date(data.created_at)
    };
  }
}
