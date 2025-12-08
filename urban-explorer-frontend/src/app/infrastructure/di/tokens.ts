import { InjectionToken } from '@angular/core';
import { IAuthPort } from '@application/ports/auth.port';
import { IUserRepository } from '@core/repositories/user.repository';
import { ILocationRepository } from '@core/repositories/location.repository';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';
import { IGeolocationPort } from '@application/ports/geolocation.port';

export const AUTH_PORT = new InjectionToken<IAuthPort>('AuthPort');
export const USER_REPOSITORY = new InjectionToken<IUserRepository>('UserRepository');
export const LOCATION_REPOSITORY = new InjectionToken<ILocationRepository>('LocationRepository');
export const REVIEW_REPOSITORY = new InjectionToken('ReviewRepository');
export const FAVORITE_REPOSITORY = new InjectionToken<IFavoriteRepository>('FavoriteRepository');
export const GEOLOCATION_PORT = new InjectionToken<IGeolocationPort>('GeolocationPort');
export const STORAGE_PORT = new InjectionToken('StoragePort');
