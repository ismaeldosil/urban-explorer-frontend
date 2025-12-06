import { Injectable } from '@angular/core';
import { ILocationRepository, SearchFilters, PaginationOptions } from '@core/repositories/location.repository';
import { LocationEntity } from '@core/entities/location.entity';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { SupabaseService } from '../services/supabase.service';
import { DomainError } from '@core/errors/domain-error';

@Injectable({ providedIn: 'root' })
export class SupabaseLocationRepository implements ILocationRepository {
  constructor(private supabase: SupabaseService) {}

  async findById(id: string): Promise<LocationEntity | null> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    if (!data) return null;

    return this.mapToEntity(data);
  }

  async findNearby(
    coordinates: Coordinates,
    radiusKm: number,
    limit?: number
  ): Promise<LocationEntity[]> {
    const { data, error } = await this.supabase.rpc('find_nearby_locations', {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
      radius_km: radiusKm,
      max_results: limit || 50,
    });

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return (data || []).map((item: any) => this.mapToEntity(item));
  }

  async findByCategory(category: string, limit?: number): Promise<LocationEntity[]> {
    let query = this.supabase
      .from('locations')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return (data || []).map((item: any) => this.mapToEntity(item));
  }

  async search(
    query: string,
    filters?: SearchFilters,
    pagination?: PaginationOptions
  ): Promise<LocationEntity[]> {
    let dbQuery = this.supabase
      .from('locations')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`);

    // Apply filters if provided
    if (filters?.categoryId) {
      dbQuery = dbQuery.eq('category_id', filters.categoryId);
    }
    if (filters?.minRating) {
      dbQuery = dbQuery.gte('rating_value', filters.minRating);
    }
    if (filters?.maxPriceLevel) {
      dbQuery = dbQuery.lte('price_level', filters.maxPriceLevel);
    }

    // Apply pagination
    const perPage = pagination?.perPage || 20;
    const offset = pagination ? (pagination.page - 1) * perPage : 0;
    dbQuery = dbQuery.range(offset, offset + perPage - 1);

    const { data, error } = await dbQuery;

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return (data || []).map((item: any) => this.mapToEntity(item));
  }

  async update(id: string, data: Partial<LocationEntity>): Promise<LocationEntity> {
    const { data: updated, error } = await this.supabase
      .from('locations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return this.mapToEntity(updated);
  }

  async save(location: LocationEntity): Promise<LocationEntity> {
    const locationData = {
      id: location.id,
      name: location.name,
      description: location.description,
      category: location.category,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      address: location.address,
      city: location.city,
      country: location.country,
      image_url: location.imageUrl,
      rating: location.rating,
      created_by: location.createdBy,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('locations')
      .upsert(locationData)
      .select()
      .single();

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(error.message, 'REPOSITORY_ERROR');
    }
  }

  private mapToEntity(data: any): LocationEntity {
    return LocationEntity.create({
      id: data.id,
      name: data.name,
      description: data.description ?? '',
      category: data.category ?? 'general',
      coordinates: Coordinates.create(
        data.latitude ?? data.lat ?? 0,
        data.longitude ?? data.lng ?? 0
      ),
      address: data.address ?? '',
      city: data.city ?? '',
      country: data.country ?? '',
      imageUrl: data.image_url ?? undefined,
      rating: data.rating ?? 0,
      createdBy: data.created_by ?? 'system',
      createdAt: new Date(data.created_at ?? Date.now()),
      updatedAt: new Date(data.updated_at ?? Date.now()),
    });
  }
}
