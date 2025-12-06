import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LocationEntity } from '@core/entities/location.entity';
import { GetNearbyLocationsUseCase } from '@application/use-cases/locations/get-nearby-locations.usecase';
import { CapacitorGeolocationAdapter } from '@infrastructure/adapters/capacitor-geolocation.adapter';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import {
  LocationCardComponent,
  LocationCardData,
} from '@presentation/components/location-card';
import { FilterChipGroupComponent } from '@presentation/components/filter-chip-group';
import { EmptyStateComponent } from '@presentation/components/empty-state';

export type SortOption = 'distance' | 'rating' | 'name';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    LocationCardComponent,
    FilterChipGroupComponent,
    EmptyStateComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/explore"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ pageTitle() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleSortMenu()">
            <ion-icon name="funnel-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Filter chips -->
      <ion-toolbar class="filter-toolbar">
        <app-filter-chip-group
          [filters]="categoryFilters"
          [selectedIds]="[selectedCategory()]"
          (filterChange)="onCategoryChange($event)"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Sort menu -->
      @if (showSortMenu()) {
        <div class="sort-menu">
          <ion-list>
            <ion-radio-group [value]="sortBy()" (ionChange)="onSortChange($event)">
              <ion-item>
                <ion-radio value="distance">Distancia</ion-radio>
              </ion-item>
              <ion-item>
                <ion-radio value="rating">Mejor valorados</ion-radio>
              </ion-item>
              <ion-item>
                <ion-radio value="name">Nombre A-Z</ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-list>
        </div>
      }

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Buscando lugares...</p>
        </div>
      }

      <!-- Empty state -->
      @if (!isLoading() && filteredLocations().length === 0) {
        <app-empty-state
          icon="location-outline"
          title="No hay lugares"
          description="No encontramos lugares para mostrar. Intenta cambiar los filtros."
        >
          <ion-button (click)="resetFilters()">Limpiar filtros</ion-button>
        </app-empty-state>
      }

      <!-- Location list -->
      @if (!isLoading() && filteredLocations().length > 0) {
        <ion-list class="location-list">
          @for (location of filteredLocations(); track location.id) {
            <app-location-card
              [location]="toCardData(location)"
              [showDistance]="true"
              (cardClick)="onLocationClick(location)"
              (favoriteClick)="onFavoriteClickEvent($event)"
            />
          }
        </ion-list>

        <!-- Infinite scroll -->
        <ion-infinite-scroll (ionInfinite)="loadMore($event)">
          <ion-infinite-scroll-content
            loadingSpinner="crescent"
            loadingText="Cargando más..."
          ></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      }
    </ion-content>
  `,
  styles: [`
    .filter-toolbar {
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 56px;
    }

    .sort-menu {
      background: var(--ion-background-color);
      border-bottom: 1px solid var(--ion-color-light-shade);
      padding: 8px 0;

      ion-list {
        padding: 0;
      }

      ion-item {
        --padding-start: 16px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;

      p {
        color: var(--ion-color-medium);
        font-size: 14px;
      }
    }

    .location-list {
      padding: 8px 16px;
      background: transparent;

      app-location-card {
        display: block;
        margin-bottom: 12px;
      }
    }
  `],
})
export class LocationListPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getNearbyLocationsUseCase = inject(GetNearbyLocationsUseCase);
  private readonly geolocationAdapter = inject(CapacitorGeolocationAdapter);

  // State
  readonly isLoading = signal(false);
  readonly locations = signal<LocationEntity[]>([]);
  readonly userPosition = signal<Coordinates | null>(null);
  readonly selectedCategory = signal<string>('all');
  readonly sortBy = signal<SortOption>('distance');
  readonly showSortMenu = signal(false);
  readonly category = signal<string | null>(null);

  // Category filters
  readonly categoryFilters = [
    { id: 'all', label: 'Todos', icon: 'apps-outline' },
    { id: 'restaurant', label: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'cafe', label: 'Cafés', icon: 'cafe-outline' },
    { id: 'park', label: 'Parques', icon: 'leaf-outline' },
    { id: 'museum', label: 'Museos', icon: 'business-outline' },
    { id: 'bar', label: 'Bares', icon: 'beer-outline' },
  ];

  // Computed
  readonly pageTitle = computed(() => {
    const cat = this.category();
    if (cat) {
      const filter = this.categoryFilters.find(f => f.id === cat);
      return filter?.label || 'Lugares';
    }
    return 'Lugares cercanos';
  });

  readonly filteredLocations = computed(() => {
    let result = this.locations();
    const cat = this.selectedCategory();

    // Filter by category
    if (cat !== 'all') {
      result = result.filter(loc => loc.category === cat);
    }

    // Sort
    const sort = this.sortBy();
    const userPos = this.userPosition();

    switch (sort) {
      case 'distance':
        if (userPos) {
          result = [...result].sort((a, b) => {
            const distA = this.calculateDistance(a, userPos);
            const distB = this.calculateDistance(b, userPos);
            return distA - distB;
          });
        }
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  });

  ngOnInit(): void {
    // Get category from route params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.category.set(params['category']);
        this.selectedCategory.set(params['category']);
      }
    });

    this.loadLocations();
  }

  private async loadLocations(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Get user position
      const position = await this.geolocationAdapter.getCurrentPosition();
      this.userPosition.set(position);

      // Get nearby locations
      const locations = await this.getNearbyLocationsUseCase.execute({
        latitude: position.latitude,
        longitude: position.longitude,
        radiusKm: 10,
        limit: 50,
      });

      this.locations.set(locations);
    } catch (error) {
      console.error('Error loading locations:', error);
      // Load with default location (Montevideo)
      try {
        const locations = await this.getNearbyLocationsUseCase.execute({
          latitude: -34.9011,
          longitude: -56.1645,
          radiusKm: 10,
          limit: 50,
        });
        this.locations.set(locations);
      } catch {
        // Handle error silently
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onCategoryChange(categoryIds: string[]): void {
    this.selectedCategory.set(categoryIds[0] || 'all');
  }

  onSortChange(event: CustomEvent): void {
    this.sortBy.set(event.detail.value);
    this.showSortMenu.set(false);
  }

  toggleSortMenu(): void {
    this.showSortMenu.update(v => !v);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.sortBy.set('distance');
  }

  onLocationClick(location: LocationEntity): void {
    this.router.navigate(['/location', location.id]);
  }

  onFavoriteClickEvent(event: {
    location: LocationCardData;
    isFavorite: boolean;
  }): void {
    // TODO: Implement toggle favorite
    console.log('Toggle favorite:', event.location.id, event.isFavorite);
  }

  toCardData(location: LocationEntity): LocationCardData {
    return {
      id: location.id,
      name: location.name,
      imageUrl: location.imageUrl,
      rating: location.rating,
      reviewCount: location.reviewCount ?? 0,
      priceLevel: 2, // Default price level
      distance: this.getDistance(location) ?? undefined,
      category: location.category,
      isOpen: undefined,
    };
  }

  async loadMore(event: CustomEvent): Promise<void> {
    // TODO: Implement pagination
    const target = event.target as HTMLIonInfiniteScrollElement;
    setTimeout(() => {
      target.complete();
    }, 500);
  }

  getDistance(location: LocationEntity): number | null {
    const userPos = this.userPosition();
    if (!userPos) return null;
    return this.calculateDistance(location, userPos);
  }

  private calculateDistance(location: LocationEntity, userPos: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(location.coordinates.latitude - userPos.latitude);
    const dLon = this.toRad(location.coordinates.longitude - userPos.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(userPos.latitude)) *
        Math.cos(this.toRad(location.coordinates.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
