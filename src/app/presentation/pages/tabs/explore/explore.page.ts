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
import * as L from 'leaflet';

import { LocationEntity } from '@core/entities/location.entity';
import { CapacitorGeolocationAdapter } from '@infrastructure/adapters/capacitor-geolocation.adapter';
import { GetNearbyLocationsUseCase } from '@application/use-cases/locations/get-nearby-locations.usecase';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationPreviewCardComponent } from '@presentation/components/location-preview-card';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/markers/marker-icon-2x.png',
  iconUrl: 'assets/markers/marker-icon.png',
  shadowUrl: 'assets/markers/marker-shadow.png',
});

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
  private readonly geolocationAdapter = inject(CapacitorGeolocationAdapter);
  private readonly getNearbyLocationsUseCase = inject(GetNearbyLocationsUseCase);

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private locationMarkers: L.Marker[] = [];
  private mapInitialized = false;

  // State signals
  readonly selectedCategory = signal<string>('all');
  readonly userPosition = signal<Coordinates | null>(null);
  readonly locations = signal<LocationEntity[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isMapReady = signal<boolean>(false);
  readonly selectedLocation = signal<LocationEntity | null>(null);

  // Categories for filtering
  readonly categories: Category[] = [
    { id: 'all', name: 'Todos', icon: 'apps-outline' },
    { id: 'restaurant', name: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'cafe', name: 'Cafes', icon: 'cafe-outline' },
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

  // Category icon mapping for markers
  private readonly categoryIcons: Record<string, string> = {
    restaurant: '#FF6B6B',
    cafe: '#8B4513',
    park: '#4CAF50',
    museum: '#9C27B0',
    bar: '#FF9800',
    shop: '#2196F3',
    default: '#607D8B',
  };

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
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
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
      // Create map centered on Montevideo
      this.map = L.map(container, {
        center: [-34.9011, -56.1645],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.mapInitialized = true;
      this.isMapReady.set(true);

      // Force resize
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);

      // Get user location
      this.initializeGeolocation();

    } catch (error) {
      console.error('Error creating map:', error);
    }
  }

  goToSearch(): void {
    this.router.navigate(['/tabs/search']);
  }

  onCategoryChange(event: CustomEvent): void {
    this.selectedCategory.set(event.detail.value);
  }

  async centerOnUser(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const position = await this.geolocationAdapter.getCurrentPosition();
      this.userPosition.set(position);

      if (this.map) {
        this.map.setView([position.latitude, position.longitude], 15, {
          animate: true,
          duration: 0.5
        });
        this.updateUserMarker(position);
      }

      await this.loadNearbyLocations(position.latitude, position.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      this.errorMessage.set('No se pudo obtener tu ubicación.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async initializeGeolocation(): Promise<void> {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = Coordinates.create(
              position.coords.latitude,
              position.coords.longitude
            );
            this.userPosition.set(coords);
            if (this.map) {
              this.map.setView([coords.latitude, coords.longitude], 15);
              this.updateUserMarker(coords);
            }
            this.loadNearbyLocations(coords.latitude, coords.longitude);
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            this.loadNearbyLocations(-34.9011, -56.1645);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        this.loadNearbyLocations(-34.9011, -56.1645);
      }
    } catch (error) {
      console.error('Error initializing geolocation:', error);
    }
  }

  private updateUserMarker(position: Coordinates): void {
    if (!this.map) return;

    if (this.userMarker) {
      this.userMarker.remove();
    }

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #4285f4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    this.userMarker = L.marker([position.latitude, position.longitude], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(this.map);

    this.userMarker.bindPopup('Tu ubicación');
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
      this.updateLocationMarkers(nearbyLocations);
    } catch (error) {
      console.error('Error loading nearby locations:', error);
      this.errorMessage.set('Error al cargar ubicaciones cercanas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateLocationMarkers(locations: LocationEntity[]): void {
    if (!this.map) return;

    // Clear existing markers
    this.locationMarkers.forEach(marker => marker.remove());
    this.locationMarkers = [];

    // Add markers for each location
    locations.forEach(location => {
      const marker = this.createLocationMarker(location);
      if (marker) {
        this.locationMarkers.push(marker);
      }
    });
  }

  private createLocationMarker(location: LocationEntity): L.Marker | null {
    if (!this.map) return null;

    const color = this.categoryIcons[location.category] || this.categoryIcons['default'];

    const customIcon = L.divIcon({
      className: 'location-marker',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    });

    const marker = L.marker(
      [location.coordinates.latitude, location.coordinates.longitude],
      { icon: customIcon }
    ).addTo(this.map);

    marker.on('click', () => {
      this.selectLocation(location);
    });

    return marker;
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
