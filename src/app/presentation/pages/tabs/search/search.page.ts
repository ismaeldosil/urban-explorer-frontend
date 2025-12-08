import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { LocationCardComponent, LocationCardData } from '../../../components/location-card/location-card.component';
import { SearchLocationsUseCase } from '@application/use-cases/locations';
import { LocationEntity } from '@core/entities/location.entity';
import { CapacitorGeolocationAdapter } from '@infrastructure/adapters/capacitor-geolocation.adapter';
import { Coordinates } from '@core/value-objects/coordinates.vo';

/** UI state for search page */
type SearchState = 'initial' | 'typing' | 'loading' | 'results' | 'empty' | 'error';

/** Search history storage key */
const SEARCH_HISTORY_KEY = 'urban_explorer_search_history';
const MAX_HISTORY_ITEMS = 5;

/** Category filter option */
interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
}

/** Popular location near user */
interface PopularLocation {
  id: string;
  name: string;
  rating: number;
  distance: string;
}

/** Search suggestion */
interface SearchSuggestion {
  id: string;
  type: 'location' | 'search';
  text: string;
  rating?: number;
  distance?: string;
  highlightStart?: number;
  highlightEnd?: number;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, IonicModule, SearchInputComponent, LocationCardComponent],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPage implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInputRef!: SearchInputComponent;

  private readonly router = inject(Router);
  private readonly modalController = inject(ModalController);
  private readonly searchUseCase = inject(SearchLocationsUseCase);
  private readonly geolocationAdapter = inject(CapacitorGeolocationAdapter);

  private readonly destroy$ = new Subject<void>();
  private readonly searchQuery$ = new Subject<string>();

  // State signals
  readonly query = signal('');
  readonly results = signal<LocationCardData[]>([]);
  readonly suggestions = signal<SearchSuggestion[]>([]);
  readonly state = signal<SearchState>('initial');
  readonly errorMessage = signal('');
  readonly selectedCategory = signal('');
  readonly recentSearches = signal<string[]>([]);
  readonly userPosition = signal<Coordinates | null>(null);
  readonly sortBy = signal<'relevance' | 'distance' | 'rating'>('relevance');
  readonly popularNearby = signal<PopularLocation[]>([
    { id: '1', name: 'Mercado Central', rating: 4.7, distance: '0.5 km' },
    { id: '2', name: 'Parque de las Esculturas', rating: 4.8, distance: '1.2 km' },
    { id: '3', name: 'Librería Antigua', rating: 4.5, distance: '0.8 km' },
  ]);

  // Computed signals
  readonly resultsCount = computed(() => this.results().length);
  readonly suggestionsCount = computed(() => this.suggestions().length);
  readonly totalSuggestionsCount = computed(() => this.results().length);
  readonly showViewAll = computed(() => this.results().length > 5);

  // Category filters (4x2 grid = 8 categories)
  readonly categories: CategoryFilter[] = [
    { id: 'restaurants', name: 'Comida', icon: 'restaurant', color: '#ff6b35' },
    { id: 'museums', name: 'Arte', icon: 'color-palette', color: '#9c27b0' },
    { id: 'history', name: 'Historia', icon: 'library', color: '#795548' },
    { id: 'parks', name: 'Parques', icon: 'leaf', color: '#28a745' },
    { id: 'bars', name: 'Bares', icon: 'wine', color: '#e91e63' },
    { id: 'views', name: 'Miradores', icon: 'telescope', color: '#00bcd4' },
    { id: 'shops', name: 'Tiendas', icon: 'storefront', color: '#3880ff' },
    { id: 'cafes', name: 'Cafés', icon: 'cafe', color: '#8b4513' },
  ];

  ngOnInit(): void {
    this.loadSearchHistory();
    this.setupSearchDebounce();
    this.initializeUserLocation();
  }

  private async initializeUserLocation(): Promise<void> {
    try {
      const coords = await this.geolocationAdapter.getCurrentPosition();
      this.userPosition.set(coords);
    } catch {
      // Fallback to browser API
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = Coordinates.create(
              position.coords.latitude,
              position.coords.longitude
            );
            this.userPosition.set(coords);
          },
          () => {
            // Silently fail - distance features won't be available
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }
  }

  ionViewDidEnter(): void {
    setTimeout(() => this.searchInputRef?.focusInput(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.length >= 2) {
        this.performSearch(query);
      }
    });
  }

  onSearch(query: string): void {
    this.query.set(query);

    if (query.length === 0) {
      this.state.set('initial');
      this.results.set([]);
      this.suggestions.set([]);
      return;
    }

    if (query.length >= 1) {
      this.state.set('typing');
      this.generateSuggestions(query);
    }

    if (query.length >= 2) {
      this.searchQuery$.next(query);
    }
  }

  onSearchSubmit(query: string): void {
    if (query.length >= 2) {
      this.addToHistory(query);
      this.performSearch(query);
    }
  }

  onClear(): void {
    this.query.set('');
    this.state.set('initial');
    this.results.set([]);
    this.suggestions.set([]);
  }

  private generateSuggestions(query: string): void {
    const lowerQuery = query.toLowerCase();

    // Generate suggestions from categories and recent searches
    const suggestions: SearchSuggestion[] = [];

    // Add search term as first suggestion
    suggestions.push({
      id: 'search-' + query,
      type: 'search',
      text: query,
    });

    // Add matching recent searches
    this.recentSearches()
      .filter(s => s.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(s => {
        const start = s.toLowerCase().indexOf(lowerQuery);
        suggestions.push({
          id: 'recent-' + s,
          type: 'search',
          text: s,
          highlightStart: start,
          highlightEnd: start + query.length,
        });
      });

    this.suggestions.set(suggestions);
  }

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

        // Generate suggestions from results
        const searchSuggestions = locations.slice(0, 5).map((loc): SearchSuggestion => ({
          id: loc.id,
          type: 'location',
          text: loc.name,
          rating: loc.rating,
          distance: loc.distance ? `${loc.distance} km` : undefined,
        }));

        this.suggestions.set(searchSuggestions);
        this.state.set(locations.length > 0 ? 'typing' : 'empty');

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

  onSuggestionClick(suggestion: SearchSuggestion): void {
    if (suggestion.type === 'location') {
      this.router.navigate(['/location', suggestion.id]);
    } else {
      this.query.set(suggestion.text);
      this.performSearch(suggestion.text);
    }
  }

  onViewAllResults(): void {
    this.state.set('results');
  }

  onCategoryClick(category: CategoryFilter): void {
    this.router.navigate(['/locations'], {
      queryParams: { category: category.id }
    });
  }

  onRecentClick(search: string): void {
    this.query.set(search);
    this.performSearch(search);
  }

  onPopularClick(location: PopularLocation): void {
    this.router.navigate(['/location', location.id]);
  }

  removeRecent(search: string, event: Event): void {
    event.stopPropagation();
    this.recentSearches.update(searches =>
      searches.filter(s => s !== search)
    );
    this.saveSearchHistory();
  }

  clearHistory(): void {
    this.recentSearches.set([]);
    this.saveSearchHistory();
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.state.set('initial');
    this.selectedCategory.set('');
  }

  retrySearch(): void {
    if (this.query().length >= 2) {
      this.performSearch(this.query());
    }
  }

  async openFilters(): Promise<void> {
    // TODO: Implement filter modal
    console.log('Open filters modal');
  }

  onLocationClick(location: LocationCardData): void {
    this.router.navigate(['/location', location.id]);
  }

  onFavoriteClick(event: { location: LocationCardData; isFavorite: boolean }): void {
    console.log('Toggle favorite:', event);
  }

  trackByLocationId(index: number, location: LocationCardData): string {
    return location.id;
  }

  trackBySuggestionId(index: number, suggestion: SearchSuggestion): string {
    return suggestion.id;
  }

  getHighlightedText(text: string, start?: number, end?: number): { before: string; highlight: string; after: string } {
    if (start === undefined || end === undefined) {
      return { before: text, highlight: '', after: '' };
    }
    return {
      before: text.substring(0, start),
      highlight: text.substring(start, end),
      after: text.substring(end),
    };
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  setSortBy(sort: 'relevance' | 'distance' | 'rating'): void {
    this.sortBy.set(sort);
    // Re-sort existing results
    if (this.results().length > 0) {
      const sorted = this.sortResults(this.results());
      this.results.set(sorted);
    }
  }

  // Private methods
  private mapEntitiesToCardData(entities: LocationEntity[]): LocationCardData[] {
    const userPos = this.userPosition();

    const mapped = entities.map(entity => {
      let distance: number | undefined;

      if (userPos && entity.coordinates) {
        // Calculate distance using Haversine formula (in km)
        const R = 6371;
        const dLat = this.toRad(entity.coordinates.latitude - userPos.latitude);
        const dLon = this.toRad(entity.coordinates.longitude - userPos.longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRad(userPos.latitude)) *
            Math.cos(this.toRad(entity.coordinates.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }

      return {
        id: entity.id,
        name: entity.name,
        imageUrl: entity.imageUrl ?? undefined,
        rating: entity.rating,
        reviewCount: entity.reviewCount || 0,
        priceLevel: 2,
        distance,
        category: this.getCategoryName(entity.category),
        isOpen: true
      };
    });

    return this.sortResults(mapped);
  }

  private sortResults(results: LocationCardData[]): LocationCardData[] {
    const sortType = this.sortBy();

    if (sortType === 'distance') {
      return [...results].sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    if (sortType === 'rating') {
      return [...results].sort((a, b) => b.rating - a.rating);
    }

    // Default: relevance (original order)
    return results;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name ?? categoryId;
  }

  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as string[];
        this.recentSearches.set(history.slice(0, MAX_HISTORY_ITEMS));
      }
    } catch {
      this.recentSearches.set([]);
    }
  }

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

  private addToHistory(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    this.recentSearches.update(searches => {
      const filtered = searches.filter(
        s => s.toLowerCase() !== trimmed.toLowerCase()
      );
      return [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });

    this.saveSearchHistory();
  }
}
