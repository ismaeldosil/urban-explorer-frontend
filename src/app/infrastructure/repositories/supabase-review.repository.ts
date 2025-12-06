import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { IReviewRepository } from '@core/repositories/review.repository';
import { ReviewEntity } from '@core/entities/review.entity';
import { Result } from '@shared/types/result.type';

interface ReviewDTO {
  id: string;
  location_id: string;
  user_id: string;
  rating: number;
  comment: string;
  photos: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SupabaseReviewRepository implements IReviewRepository {
  constructor(private supabase: SupabaseService) {}

  async getByLocationId(locationId: string): Promise<Result<ReviewEntity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url)')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(new Error(error.message));
      }

      const reviews = (data || []).map((dto: ReviewDTO) => this.mapToEntity(dto));
      return Result.ok(reviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getById(id: string): Promise<Result<ReviewEntity | null>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(new Error(error.message));
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async create(review: {
    locationId: string;
    userId: string;
    rating: number;
    comment: string;
    photos: string[];
    tags: string[];
  }): Promise<Result<ReviewEntity>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .insert({
          location_id: review.locationId,
          user_id: review.userId,
          rating: review.rating,
          comment: review.comment,
          photos: review.photos,
          tags: review.tags,
        })
        .select('*, profiles(username, avatar_url)')
        .single();

      if (error) {
        return Result.fail(new Error(error.message));
      }

      // Update location average rating
      await this.updateLocationRating(review.locationId);

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(id: string, updates: Partial<{
    rating: number;
    comment: string;
    photos: string[];
    tags: string[];
  }>): Promise<Result<ReviewEntity>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .update({
          ...(updates.rating !== undefined && { rating: updates.rating }),
          ...(updates.comment !== undefined && { comment: updates.comment }),
          ...(updates.photos !== undefined && { photos: updates.photos }),
          ...(updates.tags !== undefined && { tags: updates.tags }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, profiles(username, avatar_url)')
        .single();

      if (error) {
        return Result.fail(new Error(error.message));
      }

      // Update location average rating if rating changed
      if (updates.rating !== undefined) {
        await this.updateLocationRating(data.location_id);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      // Get location_id before deleting
      const { data: review } = await this.supabase
        .from('reviews')
        .select('location_id')
        .eq('id', id)
        .single();

      const { error } = await this.supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) {
        return Result.fail(new Error(error.message));
      }

      // Update location average rating
      if (review?.location_id) {
        await this.updateLocationRating(review.location_id);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getByUserId(userId: string, limit?: number): Promise<Result<ReviewEntity[]>> {
    try {
      let query = this.supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url), locations(name, image_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        return Result.fail(new Error(error.message));
      }

      const reviews = (data || []).map((dto: ReviewDTO) => this.mapToEntity(dto));
      return Result.ok(reviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async updateLocationRating(locationId: string): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('reviews')
        .select('rating')
        .eq('location_id', locationId);

      if (data && data.length > 0) {
        const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;

        await this.supabase
          .from('locations')
          .update({ rating: Math.round(avgRating * 10) / 10 })
          .eq('id', locationId);
      }
    } catch (error) {
      console.error('Failed to update location rating:', error);
    }
  }

  private mapToEntity(dto: ReviewDTO): ReviewEntity {
    return ReviewEntity.create({
      id: dto.id,
      locationId: dto.location_id,
      userId: dto.user_id,
      rating: dto.rating,
      comment: dto.comment,
      photos: dto.photos || [],
      tags: dto.tags || [],
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    });
  }
}
