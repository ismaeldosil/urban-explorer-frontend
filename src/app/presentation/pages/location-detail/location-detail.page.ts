import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  star,
  starOutline,
  locationOutline,
  navigateOutline,
  shareOutline,
  shareSocialOutline,
  callOutline,
  globeOutline,
  timeOutline,
  person,
  chatbubbleOutline,
  chatbubblesOutline,
  createOutline,
  chevronForwardOutline,
  chevronUpOutline,
  chevronDownOutline,
  arrowBackOutline,
  imagesOutline,
  informationCircleOutline,
  documentTextOutline,
  sparklesOutline,
  mapOutline,
  openOutline,
  refreshOutline,
  alertCircleOutline,
  pricetagOutline,
  cashOutline,
} from 'ionicons/icons';

import { LocationEntity } from '@core/entities/location.entity';
import { ReviewEntity } from '@core/entities/review.entity';
import { GetLocationDetailUseCase } from '@application/use-cases/locations/get-location-detail.usecase';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { FAVORITE_REPOSITORY, REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { StarRatingComponent } from '@presentation/components/star-rating';
import { ImageCarouselComponent } from '@presentation/components/image-carousel';

/** Review display model */
interface ReviewDisplay {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  photos: string[];
}

/** Feature/amenity model */
interface Feature {
  id: string;
  name: string;
  icon: string;
}

/** Day hours model */
interface DayHours {
  name: string;
  hours: string;
  isToday: boolean;
}

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    StarRatingComponent,
    ImageCarouselComponent,
  ],
  templateUrl: './location-detail.page.html',
  styleUrls: ['./location-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationDetailPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('miniMapContainer') miniMapContainer!: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly getLocationDetailUseCase = inject(GetLocationDetailUseCase);
  private readonly authStateService = inject(AuthStateService);
  private readonly favoriteRepository = inject(FAVORITE_REPOSITORY);
  private readonly reviewRepository = inject(REVIEW_REPOSITORY);

  private miniMap: L.Map | null = null;

  // Core state signals
  readonly location = signal<LocationEntity | null>(null);
  readonly reviews = signal<ReviewDisplay[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingReviews = signal(true);
  readonly error = signal<string | null>(null);
  readonly isFavorite = signal(false);
  readonly totalReviewsCount = signal(0);

  // UI state signals
  readonly hoursExpanded = signal(false);
  readonly descriptionExpanded = signal(false);
  readonly currentImageIndex = signal(0);

  // Computed signals
  readonly isAuthenticated = computed(() => this.authStateService.isAuthenticated());
  readonly currentUser = computed(() => this.authStateService.currentUser());
  readonly reviewsCount = computed(() => this.totalReviewsCount());

  readonly locationImages = computed(() => {
    const loc = this.location();
    if (!loc) return [];
    if (loc.images && loc.images.length > 0) {
      return loc.images;
    }
    return loc.imageUrl ? [loc.imageUrl] : [];
  });

  readonly priceLevel = computed(() => {
    const loc = this.location();
    return loc?.priceLevel ?? null;
  });

  readonly distance = computed(() => {
    // TODO: Calculate from user's current location
    return '1.2 km';
  });

  readonly features = computed((): Feature[] => {
    const loc = this.location();
    if (!loc?.amenities) return [];

    const amenityIcons: Record<string, string> = {
      wifi: 'wifi-outline',
      parking: 'car-outline',
      wheelchair: 'accessibility-outline',
      pets: 'paw-outline',
      outdoor: 'sunny-outline',
      delivery: 'bicycle-outline',
      reservation: 'calendar-outline',
      creditCard: 'card-outline',
    };

    return loc.amenities.map((amenity, index) => ({
      id: `amenity-${index}`,
      name: amenity,
      icon: amenityIcons[amenity.toLowerCase()] || 'checkmark-circle-outline',
    }));
  });

  // Opening hours
  readonly isOpen = computed(() => {
    // TODO: Calculate from actual hours
    const hour = new Date().getHours();
    return hour >= 9 && hour < 22;
  });

  readonly openingTime = computed(() => '09:00');
  readonly closingTime = computed(() => '22:00');

  // Week days for hours display
  readonly weekDays: DayHours[] = this.generateWeekDays();

  constructor() {
    addIcons({
      heart,
      heartOutline,
      star,
      starOutline,
      locationOutline,
      navigateOutline,
      shareOutline,
      shareSocialOutline,
      callOutline,
      globeOutline,
      timeOutline,
      person,
      chatbubbleOutline,
      chatbubblesOutline,
      createOutline,
      chevronForwardOutline,
      chevronUpOutline,
      chevronDownOutline,
      arrowBackOutline,
      imagesOutline,
      informationCircleOutline,
      documentTextOutline,
      sparklesOutline,
      mapOutline,
      openOutline,
      refreshOutline,
      alertCircleOutline,
      pricetagOutline,
      cashOutline,
    });
  }

  ngOnInit(): void {
    this.loadLocation();
  }

  ngOnDestroy(): void {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
    }
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/tabs/explore']);
  }

  // Location loading
  async loadLocation(): Promise<void> {
    const locationId = this.route.snapshot.paramMap.get('id');
    if (!locationId) {
      this.error.set('ID de ubicación no proporcionado');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const result = await this.getLocationDetailUseCase.execute(locationId);

    if (result.success) {
      this.location.set(result.data);
      this.loadReviews(locationId);
      this.checkFavoriteStatus(locationId);
      // Initialize mini map after a small delay
      setTimeout(() => this.initMiniMap(), 100);
    } else {
      this.error.set(result.error.message);
    }

    this.isLoading.set(false);
  }

  private async loadReviews(locationId: string): Promise<void> {
    this.isLoadingReviews.set(true);

    try {
      const result = await this.reviewRepository.getByLocationId(locationId, {
        limit: 3,
        offset: 0,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      if (result.success && result.data) {
        const reviewDisplays: ReviewDisplay[] = result.data.data.map((review: ReviewEntity) => ({
          id: review.id,
          userName: 'Usuario',
          userAvatar: undefined,
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
          photos: review.photos,
        }));
        this.reviews.set(reviewDisplays);
        this.totalReviewsCount.set(result.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }

    this.isLoadingReviews.set(false);
  }

  private async checkFavoriteStatus(locationId: string): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    try {
      const result = await this.favoriteRepository.isFavorite(user.id, locationId);
      if (result.success) {
        this.isFavorite.set(result.data);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }

  // Favorite toggle
  async toggleFavorite(): Promise<void> {
    const user = this.currentUser();
    const loc = this.location();

    if (!user) {
      const alert = await this.alertController.create({
        header: 'Iniciar sesión',
        message: 'Inicia sesión para guardar favoritos',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Iniciar sesión', handler: () => this.router.navigate(['/auth/login']) },
        ],
      });
      await alert.present();
      return;
    }

    if (!loc) return;

    const wasFavorite = this.isFavorite();

    try {
      if (wasFavorite) {
        const result = await this.favoriteRepository.delete(user.id, loc.id);
        if (result.success) {
          this.isFavorite.set(false);
          this.showToast('Eliminado de favoritos');
        }
      } else {
        const result = await this.favoriteRepository.create(user.id, loc.id);
        if (result.success) {
          this.isFavorite.set(true);
          this.showToast('Agregado a favoritos');
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      this.showToast('Error al actualizar favorito', 'danger');
    }
  }

  // Share
  async shareLocation(): Promise<void> {
    const loc = this.location();
    if (!loc) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: loc.name,
          text: loc.description || `Descubre ${loc.name} en Urban Explorer`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        this.showToast('Enlace copiado');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }

  // Actions
  openDirections(): void {
    const loc = this.location();
    if (!loc) return;

    const coords = loc.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
    window.open(url, '_blank');
  }

  callLocation(): void {
    const loc = this.location();
    if (!loc?.phone) return;

    window.open(`tel:${loc.phone}`, '_self');
  }

  openWebsite(): void {
    const loc = this.location();
    if (!loc?.website) return;

    window.open(loc.website, '_blank');
  }

  openInMaps(): void {
    const loc = this.location();
    if (!loc) return;

    const coords = loc.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    window.open(url, '_blank');
  }

  // UI toggles
  toggleHoursExpanded(): void {
    this.hoursExpanded.update(v => !v);
  }

  toggleDescription(): void {
    this.descriptionExpanded.update(v => !v);
  }

  isDescriptionLong(): boolean {
    const loc = this.location();
    return (loc?.description?.length ?? 0) > 150;
  }

  // Price level display
  getPriceLevelDisplay(): string {
    const level = this.priceLevel();
    if (level === null) return '';
    return '$'.repeat(level);
  }

  // Reviews
  async writeReview(): Promise<void> {
    const loc = this.location();
    if (!loc) return;

    this.router.navigate(['/location', loc.id, 'review']);
  }

  viewAllReviews(): void {
    const loc = this.location();
    if (!loc) return;

    this.router.navigate(['/location', loc.id, 'reviews']);
  }

  // Date formatting
  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `hace ${days} días`;
    if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
    return `hace ${Math.floor(days / 365)} años`;
  }

  // Mini map initialization
  private async initMiniMap(): Promise<void> {
    const loc = this.location();
    if (!loc || !this.miniMapContainer?.nativeElement) return;

    try {
      const L = await import('leaflet');

      if (this.miniMap) {
        this.miniMap.remove();
      }

      this.miniMap = L.map(this.miniMapContainer.nativeElement, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      }).setView(
        [loc.coordinates.latitude, loc.coordinates.longitude],
        15
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.miniMap);

      // Custom marker
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: var(--ion-color-primary, #3880ff);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker(
        [loc.coordinates.latitude, loc.coordinates.longitude],
        { icon: markerIcon }
      ).addTo(this.miniMap);
    } catch (error) {
      console.error('Failed to initialize mini map:', error);
    }
  }

  // Generate week days for hours display
  private generateWeekDays(): DayHours[] {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const today = new Date().getDay();
    // Convert Sunday=0 to Monday=0 format
    const todayIndex = today === 0 ? 6 : today - 1;

    return days.map((name, index) => ({
      name,
      hours: index < 5 ? '09:00 - 22:00' : '10:00 - 23:00',
      isToday: index === todayIndex,
    }));
  }

  // Toast helper
  private async showToast(message: string, color: string = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
