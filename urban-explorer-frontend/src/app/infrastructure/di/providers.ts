import { Provider } from '@angular/core';
import {
  AUTH_PORT,
  USER_REPOSITORY,
  LOCATION_REPOSITORY,
  STORAGE_PORT,
  GEOLOCATION_PORT,
  FAVORITE_REPOSITORY
} from './tokens';
import { SupabaseAuthAdapter } from '../adapters/supabase-auth.adapter';
import { SupabaseUserRepository } from '../repositories/supabase-user.repository';
import { SupabaseLocationRepository } from '../repositories/supabase-location.repository';
import { SupabaseFavoriteRepository } from '../repositories/supabase-favorite.repository';
import { CapacitorStorageAdapter } from '../adapters/capacitor-storage.adapter';
import { CapacitorGeolocationAdapter } from '../adapters/capacitor-geolocation.adapter';

export const INFRASTRUCTURE_PROVIDERS: Provider[] = [
  { provide: AUTH_PORT, useClass: SupabaseAuthAdapter },
  { provide: USER_REPOSITORY, useClass: SupabaseUserRepository },
  { provide: LOCATION_REPOSITORY, useClass: SupabaseLocationRepository },
  { provide: FAVORITE_REPOSITORY, useClass: SupabaseFavoriteRepository },
  { provide: STORAGE_PORT, useClass: CapacitorStorageAdapter },
  { provide: GEOLOCATION_PORT, useClass: CapacitorGeolocationAdapter },
];
