import { Injectable, signal, computed } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Coordinates } from '@core/value-objects/coordinates.vo';
import { LocationEntity } from '@core/entities/location.entity';

/** Map configuration options */
export interface MapOptions {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}

/** Marker configuration */
export interface MarkerOptions {
  selected?: boolean;
  showRating?: boolean;
}

/** Category colors for markers */
export const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#ff6b35',
  cafe: '#8b4513',
  bar: '#e91e63',
  park: '#28a745',
  museum: '#9c27b0',
  landmark: '#795548',
  shop: '#3880ff',
  entertainment: '#00bcd4',
  default: '#3880ff',
};

/** Category icons for markers (using unicode/emoji that render without Ionicons) */
export const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍷',
  park: '🌳',
  museum: '🏛️',
  landmark: '🏢',
  shop: '🛍️',
  entertainment: '🎮',
  default: '📍',
};

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private map: L.Map | null = null;
  private markerClusterGroup: L.MarkerClusterGroup | null = null;
  private userMarker: L.Marker | null = null;
  private locationMarkers = new Map<string, L.Marker>();

  // State signals
  readonly isReady = signal(false);
  readonly currentZoom = signal(14);
  readonly currentCenter = signal<[number, number]>([-34.9011, -56.1645]);

  // Callbacks
  private onMarkerClickCallback: ((location: LocationEntity) => void) | null = null;
  private onMapMoveCallback: ((bounds: L.LatLngBounds) => void) | null = null;

  /**
   * Initialize the map on a container element
   */
  initializeMap(container: HTMLElement, options: MapOptions): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(container, {
      center: options.center,
      zoom: options.zoom,
      minZoom: options.minZoom ?? 3,
      maxZoom: options.maxZoom ?? 19,
      zoomControl: options.zoomControl ?? false,
      attributionControl: options.attributionControl ?? true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Initialize marker cluster group with custom styling
    this.markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => this.createClusterIcon(cluster),
    });

    this.map.addLayer(this.markerClusterGroup);

    // Setup event listeners
    this.map.on('zoomend', () => {
      this.currentZoom.set(this.map?.getZoom() ?? 14);
    });

    this.map.on('moveend', () => {
      const center = this.map?.getCenter();
      if (center) {
        this.currentCenter.set([center.lat, center.lng]);
      }
      if (this.onMapMoveCallback && this.map) {
        this.onMapMoveCallback(this.map.getBounds());
      }
    });

    // Force resize after initialization (multiple times to ensure it works)
    // Leaflet needs the container to have explicit dimensions before it can render properly
    const resizeMap = () => {
      if (this.map) {
        this.map.invalidateSize({ animate: false });
      }
    };

    // Multiple resize calls at different intervals to handle various timing scenarios
    setTimeout(resizeMap, 0);
    setTimeout(resizeMap, 100);
    setTimeout(resizeMap, 300);
    setTimeout(resizeMap, 500);
    setTimeout(resizeMap, 1000);
    setTimeout(resizeMap, 2000);

    this.isReady.set(true);
  }

  /**
   * Create custom cluster icon
   */
  private createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
    const count = cluster.getChildCount();
    let size = 40;
    let className = 'marker-cluster marker-cluster-small';

    if (count >= 100) {
      size = 50;
      className = 'marker-cluster marker-cluster-large';
    } else if (count >= 10) {
      size = 45;
      className = 'marker-cluster marker-cluster-medium';
    }

    return L.divIcon({
      html: `<div class="cluster-inner">${count}</div>`,
      className,
      iconSize: L.point(size, size),
    });
  }

  /**
   * Set map center
   */
  setCenter(coords: Coordinates, animate = true): void {
    if (!this.map) {
      console.warn('MapService.setCenter: map not initialized');
      return;
    }
    console.log('MapService.setCenter:', coords.latitude, coords.longitude);
    this.map.setView(
      [coords.latitude, coords.longitude],
      this.map.getZoom(),
      { animate, duration: animate ? 0.5 : 0 }
    );
  }

  /**
   * Set map center and zoom together (more reliable)
   */
  setCenterAndZoom(coords: Coordinates, zoom: number, animate = true): void {
    if (!this.map) {
      console.warn('MapService.setCenterAndZoom: map not initialized');
      return;
    }
    console.log('MapService.setCenterAndZoom:', coords.latitude, coords.longitude, 'zoom:', zoom);
    this.map.setView(
      [coords.latitude, coords.longitude],
      zoom,
      { animate, duration: animate ? 0.5 : 0 }
    );
  }

  /**
   * Set map zoom level
   */
  setZoom(level: number, animate = true): void {
    if (!this.map) return;
    this.map.setZoom(level, { animate, duration: animate ? 0.3 : 0 });
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    if (!this.map) return;
    this.map.zoomIn(1, { animate: true });
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    if (!this.map) return;
    this.map.zoomOut(1, { animate: true });
  }

  /**
   * Fit map to bounds
   */
  fitBounds(bounds: L.LatLngBoundsExpression, padding?: [number, number]): void {
    if (!this.map) return;
    this.map.fitBounds(bounds, {
      padding: padding ?? [50, 50],
      animate: true,
      duration: 0.5,
    });
  }

  /**
   * Add user location marker
   */
  setUserLocation(coords: Coordinates): void {
    if (!this.map) return;

    // Remove existing user marker
    if (this.userMarker) {
      this.userMarker.remove();
    }

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

    this.userMarker = L.marker([coords.latitude, coords.longitude], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(this.map);

    this.userMarker.bindPopup('Tu ubicación');
  }

  /**
   * Add location markers with clustering
   */
  setLocations(
    locations: LocationEntity[],
    selectedId?: string | null
  ): void {
    if (!this.map || !this.markerClusterGroup) return;

    // Clear existing markers
    this.markerClusterGroup.clearLayers();
    this.locationMarkers.clear();

    // Add new markers
    locations.forEach((location) => {
      const marker = this.createLocationMarker(
        location,
        location.id === selectedId
      );
      this.locationMarkers.set(location.id, marker);
      this.markerClusterGroup!.addLayer(marker);
    });
  }

  /**
   * Add a single marker
   */
  addMarker(location: LocationEntity, options?: MarkerOptions): void {
    if (!this.map || !this.markerClusterGroup) return;

    // Remove existing marker with same id
    this.removeMarker(location.id);

    const marker = this.createLocationMarker(location, options?.selected);
    this.locationMarkers.set(location.id, marker);
    this.markerClusterGroup.addLayer(marker);
  }

  /**
   * Remove a marker by location id
   */
  removeMarker(locationId: string): void {
    const marker = this.locationMarkers.get(locationId);
    if (marker && this.markerClusterGroup) {
      this.markerClusterGroup.removeLayer(marker);
      this.locationMarkers.delete(locationId);
    }
  }

  /**
   * Clear all location markers
   */
  clearMarkers(): void {
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
    this.locationMarkers.clear();
  }

  /**
   * Select a marker (highlight it)
   */
  selectMarker(locationId: string | null): void {
    // Reset all markers to default state
    this.locationMarkers.forEach((marker, id) => {
      const icon = marker.getIcon() as L.DivIcon;
      if (icon.options.className?.includes('selected')) {
        // Get location from marker
        const latLng = marker.getLatLng();
        // Find location in markers - we need to recreate the marker
        // For simplicity, just update the class
        const element = marker.getElement();
        if (element) {
          element.classList.remove('selected');
          element.style.transform = element.style.transform.replace(
            /scale\([^)]+\)/,
            'scale(1)'
          );
        }
      }
    });

    // Highlight selected marker
    if (locationId) {
      const marker = this.locationMarkers.get(locationId);
      if (marker) {
        const element = marker.getElement();
        if (element) {
          element.classList.add('selected');
          // Scale up the marker
          element.style.transform = element.style.transform + ' scale(1.2)';
        }
        // Center on marker
        const latLng = marker.getLatLng();
        this.map?.setView(latLng, this.map.getZoom(), { animate: true });
      }
    }
  }

  /**
   * Register callback for marker clicks
   */
  onMarkerClick(callback: (location: LocationEntity) => void): void {
    this.onMarkerClickCallback = callback;
  }

  /**
   * Register callback for map move
   */
  onMapMove(callback: (bounds: L.LatLngBounds) => void): void {
    this.onMapMoveCallback = callback;
  }

  /**
   * Get current map bounds
   */
  getBounds(): L.LatLngBounds | null {
    return this.map?.getBounds() ?? null;
  }

  /**
   * Invalidate map size (call after container resize)
   */
  invalidateSize(): void {
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  /**
   * Destroy the map instance
   */
  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markerClusterGroup = null;
    this.userMarker = null;
    this.locationMarkers.clear();
    this.isReady.set(false);
  }

  /**
   * Create a location marker with category-based styling
   */
  private createLocationMarker(
    location: LocationEntity,
    selected = false
  ): L.Marker {
    const category = location.category.toLowerCase();
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
    const iconName = CATEGORY_ICONS[category] || CATEGORY_ICONS['default'];
    const scale = selected ? 1.2 : 1;

    const icon = L.divIcon({
      className: `location-marker ${category} ${selected ? 'selected' : ''}`,
      html: `
        <div class="marker-pin" style="--marker-color: ${color}; transform: scale(${scale});">
          <div class="marker-head">
            <span class="marker-emoji">${iconName}</span>
          </div>
          ${location.rating > 0 ? `
            <div class="marker-rating">
              <span>${location.rating.toFixed(1)}</span>
            </div>
          ` : ''}
        </div>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52],
    });

    const marker = L.marker(
      [location.coordinates.latitude, location.coordinates.longitude],
      { icon }
    );

    // Store location data on marker for click handler
    (marker as any)._locationData = location;

    marker.on('click', () => {
      if (this.onMarkerClickCallback) {
        this.onMarkerClickCallback(location);
      }
    });

    return marker;
  }
}
