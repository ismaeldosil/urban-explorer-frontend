import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import * as L from 'leaflet';

import { SearchInputComponent } from '../../../components/search-input/search-input.component';
import { LocationEntity } from '@core/entities/location.entity';
import { CapacitorGeolocationAdapter } from '@infrastructure/adapters/capacitor-geolocation.adapter';
import { GetNearbyLocationsUseCase } from '@application/use-cases/locations/get-nearby-locations.usecase';
import { Coordinates } from '@core/value-objects/coordinates.vo';

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
  imports: [CommonModule, IonicModule, SearchInputComponent],
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss']
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

  // State signals
  readonly selectedCategory = signal<string>('all');
  readonly userPosition = signal<Coordinates | null>(null);
  readonly locations = signal<LocationEntity[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isMapReady = signal<boolean>(false);

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
    this.initializeGeolocation();
  }

  ngAfterViewInit(): void {
    // Wait for platform ready and DOM to be stable
    this.platform.ready().then(() => {
      setTimeout(() => this.initializeMap(), 100);
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
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
      this.errorMessage.set('No se pudo obtener tu ubicacion. Verifica los permisos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onMarkerClick(location: LocationEntity): Promise<void> {
    this.router.navigate(['/location', location.id]);
  }

  private async initializeGeolocation(): Promise<void> {
    try {
      const permission = await this.geolocationAdapter.checkPermissions();

      if (permission === 'prompt') {
        await this.geolocationAdapter.requestPermissions();
      }

      if (permission === 'granted' || permission === 'prompt') {
        await this.centerOnUser();
      }
    } catch (error) {
      console.error('Error initializing geolocation:', error);
      // Use default location (Madrid, Spain)
      this.setDefaultLocation();
    }
  }

  private setDefaultLocation(): void {
    const defaultCoords = Coordinates.create(40.4168, -3.7038);
    this.userPosition.set(defaultCoords);

    if (this.map) {
      this.map.setView([40.4168, -3.7038], 13);
    }

    this.loadNearbyLocations(40.4168, -3.7038);
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container not found');
      return;
    }

    // Default center (Madrid, Spain)
    const defaultLat = 40.4168;
    const defaultLng = -3.7038;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Add zoom control in bottom left
    L.control.zoom({
      position: 'bottomleft'
    }).addTo(this.map);

    this.isMapReady.set(true);

    // If we already have user position, center on it
    const position = this.userPosition();
    if (position) {
      this.map.setView([position.latitude, position.longitude], 15);
      this.updateUserMarker(position);
    }
  }

  private updateUserMarker(position: Coordinates): void {
    if (!this.map) return;

    // Remove existing user marker
    if (this.userMarker) {
      this.userMarker.remove();
    }

    // Create custom user marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-marker-outer">
          <div class="user-marker-inner"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    this.userMarker = L.marker([position.latitude, position.longitude], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(this.map);

    this.userMarker.bindPopup('Tu ubicacion');
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
        <div class="marker-pin" style="background-color: ${color}">
          <ion-icon name="${this.getCategoryIcon(location.category)}"></ion-icon>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    });

    const marker = L.marker(
      [location.coordinates.latitude, location.coordinates.longitude],
      { icon: customIcon }
    ).addTo(this.map);

    // Create popup content
    const popupContent = this.createPopupContent(location);
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'location-popup',
    });

    // Handle marker click
    marker.on('click', () => {
      marker.openPopup();
    });

    return marker;
  }

  private getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      restaurant: 'restaurant-outline',
      cafe: 'cafe-outline',
      park: 'leaf-outline',
      museum: 'library-outline',
      bar: 'beer-outline',
      shop: 'storefront-outline',
    };
    return iconMap[category] || 'location-outline';
  }

  private createPopupContent(location: LocationEntity): HTMLElement {
    const container = document.createElement('div');
    container.className = 'popup-content';

    container.innerHTML = `
      <div class="popup-header">
        ${location.imageUrl ? `<img src="${location.imageUrl}" alt="${location.name}" class="popup-image" />` : ''}
        <h3 class="popup-title">${location.name}</h3>
      </div>
      <p class="popup-address">${location.address}</p>
      <div class="popup-rating">
        <ion-icon name="star" style="color: #FFD700"></ion-icon>
        <span>${location.rating.toFixed(1)}</span>
      </div>
      <button class="popup-button" data-location-id="${location.id}">
        Ver detalles
      </button>
    `;

    // Add click handler for the button
    const button = container.querySelector('.popup-button');
    if (button) {
      button.addEventListener('click', () => {
        this.router.navigate(['/location', location.id]);
      });
    }

    return container;
  }
}
