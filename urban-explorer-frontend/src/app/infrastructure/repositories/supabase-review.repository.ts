import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { DomainError } from '@core/errors/domain-error';

// Placeholder repository - to be fully implemented when Review entity is created
@Injectable({ providedIn: 'root' })
export class SupabaseReviewRepository {
  constructor(private supabase: SupabaseService) {}

  async findByLocationId(locationId: string, limit?: number): Promise<any[]> {
    let query = this.supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return data || [];
  }

  async findByUserId(userId: string, limit?: number): Promise<any[]> {
    let query = this.supabase
      .from('reviews')
      .select('*, locations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return data || [];
  }

  async create(review: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }
  }
}
