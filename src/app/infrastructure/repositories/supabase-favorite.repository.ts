import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { DomainError } from '@core/errors/domain-error';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { FavoriteEntity } from '@core/entities/favorite.entity';
import { Result } from '@shared/types/result.type';

export interface FavoriteWithLocation extends FavoriteEntity {
  location?: {
    id: string;
    name: string;
    description: string;
    address: string;
    category_id: string;
    category_name?: string;
    rating: number;
    review_count: number;
    price_level: number;
    photos: string[];
    latitude: number;
    longitude: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SupabaseFavoriteRepository implements IFavoriteRepository {
  constructor(private supabase: SupabaseService) {}

  async getByUserId(userId: string): Promise<Result<FavoriteEntity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          location_id,
          created_at,
          locations (
            id,
            name,
            description,
            address,
            category_id,
            rating,
            review_count,
            price_level,
            photos,
            latitude,
            longitude,
            categories (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(new DomainError(error.message, 'REPOSITORY_ERROR'));
      }

      const favorites: FavoriteWithLocation[] = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        locationId: item.location_id,
        createdAt: new Date(item.created_at),
        location: item.locations ? {
          id: item.locations.id,
          name: item.locations.name,
          description: item.locations.description,
          address: item.locations.address,
          category_id: item.locations.category_id,
          category_name: item.locations.categories?.name,
          rating: item.locations.rating || 0,
          review_count: item.locations.review_count || 0,
          price_level: item.locations.price_level || 1,
          photos: item.locations.photos || [],
          latitude: item.locations.latitude,
          longitude: item.locations.longitude,
        } : undefined,
      }));

      return Result.ok(favorites);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async create(userId: string, locationId: string): Promise<Result<FavoriteEntity>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .insert({
          user_id: userId,
          location_id: locationId,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(new DomainError(error.message, 'REPOSITORY_ERROR'));
      }

      return Result.ok({
        id: data.id,
        userId: data.user_id,
        locationId: data.location_id,
        createdAt: new Date(data.created_at),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(userId: string, locationId: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('location_id', locationId);

      if (error) {
        return Result.fail(new DomainError(error.message, 'REPOSITORY_ERROR'));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async isFavorite(userId: string, locationId: string): Promise<Result<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('location_id', locationId)
        .maybeSingle();

      if (error) {
        return Result.fail(new DomainError(error.message, 'REPOSITORY_ERROR'));
      }

      return Result.ok(!!data);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
