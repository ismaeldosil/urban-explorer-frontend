import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

import { LocationEntity } from '@core/entities/location.entity';
import { GetNearbyLocationsUseCase } from '@application/use-cases/locations/get-nearby-locations.usecase';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationPreviewCardComponent } from '@presentation/components/location-preview-card';
import { MapService } from '@infrastructure/services/map.service';
import { GeolocationService } from '@infrastructure/services/geolocation.service';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, IonicModule, LocationPreviewCardComponent],
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly platform = inject(Platform);
  private readonly geolocationService = inject(GeolocationService);
  private readonly getNearbyLocationsUseCase = inject(GetNearbyLocationsUseCase);
  private readonly mapService = inject(MapService);

  private mapInitialized = false;
  private previewTouchStartY = 0;
  private previewTranslateY = 0;

  // State signals
  readonly selectedCategory = signal<string>('all');
  readonly userPosition = signal<Coordinates | null>(null);
  readonly locations = signal<LocationEntity[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isLocating = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isMapReady = signal<boolean>(false);
  readonly selectedLocation = signal<LocationEntity | null>(null);
  readonly locationPermissionDenied = signal<boolean>(false);
  readonly unreadNotifications = signal<number>(0);
  readonly favoriteLocationIds = signal<Set<string>>(new Set());

  // Categories for filtering
  readonly categories: Category[] = [
    { id: 'all', name: 'Todos', icon: 'apps-outline' },
    { id: 'restaurant', name: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'cafe', name: 'Cafés', icon: 'cafe-outline' },
    { id: 'park', name: 'Parques', icon: 'leaf-outline' },
    { id: 'museum', name: 'Museos', icon: 'library-outline' },
    { id: 'bar', name: 'Bares', icon: 'beer-outline' },
    { id: 'shop', name: 'Tiendas', icon: 'storefront-outline' },
  ];

  // Filtered locations based on selected category
  readonly filteredLocations = computed(() => {
    const category = this.selectedCategory();
    const allLocations = this.locations();

    if (category === 'all') {
      return allLocations;
    }

    return allLocations.filter(location => location.category === category);
  });

  constructor() {
    // Effect to update markers when filtered locations change
    effect(() => {
      const filtered = this.filteredLocations();
      if (this.isMapReady()) {
        this.updateLocationMarkers(filtered);
      }
    });
  }

  ngOnInit(): void {
    console.log('ExplorePage ngOnInit');
  }

  ngAfterViewInit(): void {
    console.log('ExplorePage ngAfterViewInit');
    this.platform.ready().then(() => {
      setTimeout(() => this.initMap(), 300);
    });
  }

  ngOnDestroy(): void {
    this.mapService.destroy();
  }

  private initMap(): void {
    const container = this.mapContainer?.nativeElement;
    console.log('initMap called, container:', container);

    if (!container) {
      console.error('Map container not found!');
      return;
    }

    if (this.mapInitialized) {
      return;
    }

    try {
      // Initialize map with MapService (includes clustering)
      this.mapService.initializeMap(container, {
        center: [-34.9011, -56.1645],
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      // Register marker click callback
      this.mapService.onMarkerClick((location) => {
        this.selectLocation(location);
      });

      this.mapInitialized = true;
      this.isMapReady.set(true);

      // Get user location
      this.initializeGeolocation();

    } catch (error) {
      console.error('Error creating map:', error);
    }
  }

  goToSearch(): void {
    this.router.navigate(['/tabs/search']);
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  openLocationSettings(): void {
    // TODO: Open device location settings
    // For now, try to get location again
    this.centerOnUser();
  }

  zoomIn(): void {
    this.mapService.zoomIn();
  }

  zoomOut(): void {
    this.mapService.zoomOut();
  }

  isLocationFavorite(location: LocationEntity): boolean {
    return this.favoriteLocationIds().has(location.id);
  }

  // Preview sheet swipe-to-dismiss handlers
  onPreviewTouchStart(event: TouchEvent): void {
    this.previewTouchStartY = event.touches[0].clientY;
    this.previewTranslateY = 0;
  }

  onPreviewTouchMove(event: TouchEvent): void {
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.previewTouchStartY;

    // Only allow swiping down
    if (deltaY > 0) {
      this.previewTranslateY = deltaY;
      const previewSheet = document.querySelector('.preview-sheet') as HTMLElement;
      if (previewSheet) {
        previewSheet.style.transform = `translateY(${deltaY}px)`;
      }
    }
  }

  onPreviewTouchEnd(): void {
    const previewSheet = document.querySelector('.preview-sheet') as HTMLElement;

    // If swiped more than 100px, close the preview
    if (this.previewTranslateY > 100) {
      this.closePreview();
    } else if (previewSheet) {
      // Reset position
      previewSheet.style.transform = 'translateY(0)';
    }

    this.previewTranslateY = 0;
  }

  async centerOnUser(): Promise<void> {
    this.isLocating.set(true);
    this.errorMessage.set(null);
    this.locationPermissionDenied.set(false);

    const result = await this.geolocationService.getCurrentPosition();

    if (result.success) {
      const coords = result.data.coordinates;
      console.log('centerOnUser - Got position:', coords.latitude, coords.longitude);

      this.userPosition.set(coords);
      this.mapService.setCenterAndZoom(coords, 15, true);
      this.mapService.setUserLocation(coords);

      await this.loadNearbyLocations(coords.latitude, coords.longitude);
    } else {
      console.error('Error getting location:', result.error.message);

      // Fallback to browser API
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            });
          });

          const coords = Coordinates.create(
            position.coords.latitude,
            position.coords.longitude
          );
          console.log('centerOnUser - Got position from browser:', coords.latitude, coords.longitude);

          this.userPosition.set(coords);
          this.mapService.setCenterAndZoom(coords, 15, true);
          this.mapService.setUserLocation(coords);

          await this.loadNearbyLocations(coords.latitude, coords.longitude);
        } catch (browserError) {
          console.error('Browser geolocation also failed:', browserError);
          this.errorMessage.set('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
          this.locationPermissionDenied.set(true);
        }
      } else {
        this.errorMessage.set('Tu navegador no soporta geolocalización.');
        this.locationPermissionDenied.set(true);
      }
    }

    this.isLocating.set(false);
  }

  private async initializeGeolocation(): Promise<void> {
    this.isLocating.set(true);

    const result = await this.geolocationService.getCurrentPosition();

    if (result.success) {
      const coords = result.data.coordinates;
      console.log('initializeGeolocation - Got user position:', coords.latitude, coords.longitude);

      this.userPosition.set(coords);
      this.mapService.setCenterAndZoom(coords, 15, false);
      this.mapService.setUserLocation(coords);
      await this.loadNearbyLocations(coords.latitude, coords.longitude);
      this.isLocating.set(false);
    } else {
      console.warn('Geolocation error:', result.error.message);

      if (result.error.code === 'PERMISSION_DENIED') {
        this.locationPermissionDenied.set(true);
      }

      // Fallback to browser API
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = Coordinates.create(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('initializeGeolocation - Got position from browser API:', coords.latitude, coords.longitude);
            this.userPosition.set(coords);
            this.mapService.setCenterAndZoom(coords, 15, false);
            this.mapService.setUserLocation(coords);
            this.loadNearbyLocations(coords.latitude, coords.longitude);
            this.isLocating.set(false);
          },
          (geoError) => {
            console.warn('Browser geolocation also failed:', geoError.message);
            this.locationPermissionDenied.set(true);
            this.loadNearbyLocations(-34.9011, -56.1645);
            this.isLocating.set(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        this.locationPermissionDenied.set(true);
        this.loadNearbyLocations(-34.9011, -56.1645);
        this.isLocating.set(false);
      }
    }
  }

  private async loadNearbyLocations(latitude: number, longitude: number): Promise<void> {
    this.isLoading.set(true);

    try {
      const nearbyLocations = await this.getNearbyLocationsUseCase.execute({
        latitude,
        longitude,
        radiusKm: 5,
        limit: 100,
      });

      this.locations.set(nearbyLocations);
      // Use MapService for clustering
      this.mapService.setLocations(nearbyLocations, this.selectedLocation()?.id);
    } catch (error) {
      console.error('Error loading nearby locations:', error);
      this.errorMessage.set('Error al cargar ubicaciones cercanas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateLocationMarkers(locations: LocationEntity[]): void {
    // Use MapService for clustering with selected marker
    this.mapService.setLocations(locations, this.selectedLocation()?.id);
  }

  selectLocation(location: LocationEntity): void {
    this.selectedLocation.set(location);
  }

  closePreview(): void {
    this.selectedLocation.set(null);
  }

  onPreviewFavorite(location: LocationEntity): void {
    // TODO: Implement toggle favorite
    console.log('Toggle favorite:', location.id);
  }

  onViewLocationDetails(location: LocationEntity): void {
    this.router.navigate(['/location', location.id]);
  }

  getDistanceToLocation(location: LocationEntity): number | null {
    const userPos = this.userPosition();
    if (!userPos) return null;

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
