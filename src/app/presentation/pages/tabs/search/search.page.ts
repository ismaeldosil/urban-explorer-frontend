import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { LocationCardComponent, LocationCardData } from '../../../components/location-card/location-card.component';
import { SearchLocationsUseCase } from '@application/use-cases/locations';
import { LocationEntity } from '@core/entities/location.entity';

/** UI state machine for search page */
type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error';

/** Search history storage key */
const SEARCH_HISTORY_KEY = 'urban_explorer_search_history';
const MAX_HISTORY_ITEMS = 10;

/** Category filter option */
interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, IonicModule, SearchInputComponent, LocationCardComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/explore"></ion-back-button>
        </ion-buttons>
        <app-search-input
          placeholder="Buscar lugares..."
          [autofocus]="true"
          [loading]="state() === 'loading'"
          [value]="query()"
          (searchChange)="onSearch($event)"
          (searchSubmit)="onSearchSubmit($event)"
        ></app-search-input>
      </ion-toolbar>

      <!-- Category Filters -->
      <ion-toolbar *ngIf="showFilters()" class="filter-toolbar">
        <ion-segment
          [value]="selectedCategory()"
          (ionChange)="onCategoryChange($event)"
          scrollable
        >
          <ion-segment-button value="">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button *ngFor="let cat of categories" [value]="cat.id">
            <ion-icon [name]="cat.icon"></ion-icon>
            <ion-label>{{ cat.name }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Recent Searches (idle state) -->
      <div *ngIf="state() === 'idle'" class="section">
        <div *ngIf="recentSearches().length > 0">
          <div class="section-header">
            <h3 class="section-title">Busquedas recientes</h3>
            <ion-button fill="clear" size="small" (click)="clearHistory()">
              Limpiar
            </ion-button>
          </div>
          <ion-list lines="none" class="recent-list">
            <ion-item
              *ngFor="let search of recentSearches()"
              button
              (click)="onRecentClick(search)"
            >
              <ion-icon name="time-outline" slot="start" color="medium"></ion-icon>
              <ion-label>{{ search }}</ion-label>
              <ion-button
                fill="clear"
                slot="end"
                (click)="removeRecent(search, $event)"
              >
                <ion-icon name="close-outline" color="medium"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>

        <!-- Popular Categories -->
        <div class="popular-section">
          <h3 class="section-title">Categorias populares</h3>
          <div class="category-grid">
            <ion-card
              *ngFor="let cat of categories"
              button
              (click)="onCategoryClick(cat)"
              class="category-card"
            >
              <ion-icon [name]="cat.icon" color="primary"></ion-icon>
              <span>{{ cat.name }}</span>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="state() === 'loading'" class="section">
        <app-location-card
          *ngFor="let _ of [1,2,3]"
          [skeleton]="true"
        ></app-location-card>
      </div>

      <!-- Results State -->
      <div *ngIf="state() === 'results'" class="section">
        <p class="results-count">{{ resultsCount() }} resultados</p>
        <app-location-card
          *ngFor="let location of results(); trackBy: trackByLocationId"
          [location]="location"
          [showFavorite]="true"
          (cardClick)="onLocationClick($event)"
          (favoriteClick)="onFavoriteClick($event)"
        ></app-location-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="state() === 'empty'" class="empty-state">
        <ion-icon name="search-outline"></ion-icon>
        <h3>Sin resultados</h3>
        <p>No encontramos lugares para "{{ query() }}"</p>
        <ion-button fill="outline" (click)="clearSearch()">
          Nueva busqueda
        </ion-button>
      </div>

      <!-- Error State -->
      <div *ngIf="state() === 'error'" class="error-state">
        <ion-icon name="cloud-offline-outline" color="danger"></ion-icon>
        <h3>Error de conexion</h3>
        <p>{{ errorMessage() }}</p>
        <ion-button (click)="retrySearch()">
          <ion-icon name="refresh-outline" slot="start"></ion-icon>
          Reintentar
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-toolbar {
      --padding-start: 0;
      --padding-end: 16px;
    }
    app-search-input {
      flex: 1;
    }
    .filter-toolbar {
      --padding-start: 8px;
      --padding-end: 8px;
    }
    .filter-toolbar ion-segment {
      --background: transparent;
    }
    .filter-toolbar ion-segment-button {
      --indicator-height: 3px;
      min-width: auto;
      font-size: 13px;
    }
    .filter-toolbar ion-segment-button ion-icon {
      font-size: 18px;
      margin-right: 4px;
    }
    .section {
      padding: 16px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      margin: 0 0 12px 4px;
    }
    .section-header .section-title {
      margin-bottom: 0;
    }
    .recent-list {
      background: transparent;
    }
    .recent-list ion-item {
      --background: transparent;
      --padding-start: 4px;
    }
    .results-count {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin: 0 0 12px 4px;
    }

    /* Popular Categories */
    .popular-section {
      margin-top: 24px;
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .category-card {
      margin: 0;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      border-radius: 12px;
    }
    .category-card ion-icon {
      font-size: 28px;
    }
    .category-card span {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
    }

    /* Empty State */
    .empty-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .empty-state ion-icon, .error-state ion-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    .empty-state h3, .error-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--ion-text-color);
      margin: 0 0 8px 0;
    }
    .empty-state p, .error-state p {
      font-size: 14px;
      margin: 0 0 24px 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly searchUseCase = inject(SearchLocationsUseCase);

  // State signals
  readonly query = signal('');
  readonly results = signal<LocationCardData[]>([]);
  readonly state = signal<SearchState>('idle');
  readonly errorMessage = signal('');
  readonly selectedCategory = signal('');
  readonly recentSearches = signal<string[]>([]);

  // Computed signals
  readonly resultsCount = computed(() => this.results().length);
  readonly showFilters = computed(() =>
    this.state() === 'results' || this.state() === 'loading'
  );

  // Category filters
  readonly categories: CategoryFilter[] = [
    { id: 'restaurants', name: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'cafes', name: 'Cafeterias', icon: 'cafe-outline' },
    { id: 'bars', name: 'Bares', icon: 'beer-outline' },
    { id: 'museums', name: 'Museos', icon: 'business-outline' },
    { id: 'parks', name: 'Parques', icon: 'leaf-outline' },
    { id: 'shops', name: 'Tiendas', icon: 'storefront-outline' },
  ];

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadSearchHistory();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  /**
   * Handle search input changes
   */
  onSearch(query: string): void {
    this.query.set(query);

    if (query.length < 2) {
      this.state.set('idle');
      this.results.set([]);
      return;
    }

    this.performSearch(query);
  }

  /**
   * Handle search submit (enter key)
   */
  onSearchSubmit(query: string): void {
    if (query.length >= 2) {
      this.addToHistory(query);
      this.performSearch(query);
    }
  }

  /**
   * Perform search using the use case
   */
  async performSearch(query: string): Promise<void> {
    this.state.set('loading');
    this.errorMessage.set('');

    try {
      const result = await this.searchUseCase.execute({
        query,
        filters: this.selectedCategory()
          ? { categoryId: this.selectedCategory() }
          : undefined,
        limit: 20
      });

      if (result.success) {
        const locations = this.mapEntitiesToCardData(result.data);
        this.results.set(locations);
        this.state.set(locations.length > 0 ? 'results' : 'empty');

        // Add to history on successful search with results
        if (locations.length > 0) {
          this.addToHistory(query);
        }
      } else {
        this.errorMessage.set(result.error.message);
        this.state.set('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.errorMessage.set(message);
      this.state.set('error');
    }
  }

  /**
   * Handle category filter change
   */
  onCategoryChange(event: CustomEvent): void {
    const categoryId = event.detail.value ?? '';
    this.selectedCategory.set(categoryId);

    if (this.query().length >= 2) {
      this.performSearch(this.query());
    }
  }

  /**
   * Handle category card click from popular categories
   */
  onCategoryClick(category: CategoryFilter): void {
    this.selectedCategory.set(category.id);
    this.query.set(category.name);
    this.performSearch(category.name);
  }

  /**
   * Handle recent search click
   */
  onRecentClick(search: string): void {
    this.query.set(search);
    this.performSearch(search);
  }

  /**
   * Remove item from search history
   */
  removeRecent(search: string, event: Event): void {
    event.stopPropagation();
    this.recentSearches.update(searches =>
      searches.filter(s => s !== search)
    );
    this.saveSearchHistory();
  }

  /**
   * Clear all search history
   */
  clearHistory(): void {
    this.recentSearches.set([]);
    this.saveSearchHistory();
  }

  /**
   * Clear current search
   */
  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.state.set('idle');
    this.selectedCategory.set('');
  }

  /**
   * Retry failed search
   */
  retrySearch(): void {
    if (this.query().length >= 2) {
      this.performSearch(this.query());
    }
  }

  /**
   * Handle location card click
   */
  onLocationClick(location: LocationCardData): void {
    this.router.navigate(['/tabs/explore/location', location.id]);
  }

  /**
   * Handle favorite toggle
   */
  onFavoriteClick(event: { location: LocationCardData; isFavorite: boolean }): void {
    // TODO: Implement favorite toggle with ToggleFavoriteUseCase
    console.log('Toggle favorite:', event);
  }

  /**
   * Track by function for location cards
   */
  trackByLocationId(index: number, location: LocationCardData): string {
    return location.id;
  }

  // ========== Private Methods ==========

  /**
   * Map LocationEntity array to LocationCardData array
   */
  private mapEntitiesToCardData(entities: LocationEntity[]): LocationCardData[] {
    return entities.map(entity => this.mapEntityToCardData(entity));
  }

  /**
   * Map single LocationEntity to LocationCardData
   */
  private mapEntityToCardData(entity: LocationEntity): LocationCardData {
    return {
      id: entity.id,
      name: entity.name,
      imageUrl: entity.imageUrl ?? undefined,
      rating: entity.rating,
      reviewCount: 0, // Would need to fetch from reviews
      priceLevel: 2, // Default price level
      distance: undefined, // Would need user location to calculate
      category: this.getCategoryName(entity.category),
      isOpen: true // Default to open, would need opening hours to determine
    };
  }

  /**
   * Get human-readable category name
   */
  private getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name ?? categoryId;
  }

  /**
   * Load search history from localStorage
   */
  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as string[];
        this.recentSearches.set(history.slice(0, MAX_HISTORY_ITEMS));
      }
    } catch {
      // Ignore parsing errors, start with empty history
      this.recentSearches.set([]);
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveSearchHistory(): void {
    try {
      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(this.recentSearches())
      );
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Add search term to history
   */
  private addToHistory(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    this.recentSearches.update(searches => {
      // Remove if exists and add to beginning
      const filtered = searches.filter(
        s => s.toLowerCase() !== trimmed.toLowerCase()
      );
      return [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });

    this.saveSearchHistory();
  }
}
