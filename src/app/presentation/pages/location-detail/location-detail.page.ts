import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonAvatar,
  IonSkeletonText,
  IonSpinner,
  IonBadge,
  IonFab,
  IonFabButton,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heart,
  heartOutline,
  star,
  starOutline,
  location,
  navigate,
  share,
  call,
  globe,
  time,
  person,
  chatbubble,
  add,
  chevronForward,
  mapOutline,
} from 'ionicons/icons';

import { LocationEntity } from '@core/entities/location.entity';
import { ReviewEntity } from '@core/entities/review.entity';
import { GetLocationDetailUseCase } from '@application/use-cases/locations/get-location-detail.usecase';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { FAVORITE_REPOSITORY, REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { StarRatingComponent } from '@presentation/components/star-rating';

interface ReviewDisplay {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  photos: string[];
}

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonAvatar,
    IonSkeletonText,
    IonSpinner,
    IonBadge,
    IonFab,
    IonFabButton,
    StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/explore"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ location()?.name || 'Location' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="shareLocation()">
            <ion-icon slot="icon-only" name="share"></ion-icon>
          </ion-button>
          <ion-button (click)="toggleFavorite()">
            <ion-icon
              slot="icon-only"
              [name]="isFavorite() ? 'heart' : 'heart-outline'"
              [color]="isFavorite() ? 'danger' : 'medium'"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <ion-skeleton-text [animated]="true" style="width: 100%; height: 250px;"></ion-skeleton-text>
          <div class="skeleton-content">
            <ion-skeleton-text [animated]="true" style="width: 70%; height: 24px;"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 40%; height: 16px; margin-top: 8px;"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 90%; height: 60px; margin-top: 16px;"></ion-skeleton-text>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error-container">
          <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
          <h2>Error loading location</h2>
          <p>{{ error() }}</p>
          <ion-button (click)="loadLocation()">Try Again</ion-button>
        </div>
      }

      <!-- Location Content -->
      @if (location() && !isLoading()) {
        <!-- Hero Image -->
        <div class="hero-image">
          @if (location()!.imageUrl) {
            <img [src]="location()!.imageUrl" [alt]="location()!.name" />
          } @else {
            <div class="no-image">
              <ion-icon name="image-outline"></ion-icon>
            </div>
          }
          <div class="hero-overlay">
            <ion-chip [color]="getCategoryColor(location()!.category)">
              <ion-label>{{ location()!.category }}</ion-label>
            </ion-chip>
          </div>
        </div>

        <!-- Location Info -->
        <div class="location-info">
          <h1>{{ location()!.name }}</h1>

          <div class="rating-row">
            <app-star-rating [rating]="location()!.rating" [readonly]="true"></app-star-rating>
            <span class="rating-text">{{ location()!.rating.toFixed(1) }}</span>
            <span class="reviews-count">({{ reviewsCount() }} reviews)</span>
          </div>

          <div class="address-row">
            <ion-icon name="location"></ion-icon>
            <span>{{ location()!.address }}, {{ location()!.city }}</span>
          </div>

          <p class="description">{{ location()!.description }}</p>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <ion-button expand="block" (click)="openDirections()">
              <ion-icon slot="start" name="navigate"></ion-icon>
              Get Directions
            </ion-button>
            <ion-button expand="block" fill="outline" (click)="showOnMap()">
              <ion-icon slot="start" name="map-outline"></ion-icon>
              Show on Map
            </ion-button>
          </div>
        </div>

        <!-- Reviews Section -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              Reviews
              <ion-badge color="primary">{{ reviewsCount() }}</ion-badge>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @if (isLoadingReviews()) {
              <div class="reviews-loading">
                <ion-spinner name="crescent"></ion-spinner>
              </div>
            } @else if (reviews().length === 0) {
              <div class="no-reviews">
                <ion-icon name="chatbubble-outline"></ion-icon>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            } @else {
              <ion-list>
                @for (review of reviews().slice(0, 3); track review.id) {
                  <ion-item lines="none">
                    <ion-avatar slot="start">
                      @if (review.userAvatar) {
                        <img [src]="review.userAvatar" />
                      } @else {
                        <div class="default-avatar">
                          <ion-icon name="person"></ion-icon>
                        </div>
                      }
                    </ion-avatar>
                    <ion-label>
                      <h3>{{ review.userName }}</h3>
                      <div class="review-rating">
                        <app-star-rating [rating]="review.rating" [readonly]="true" [size]="'small'"></app-star-rating>
                        <span class="review-date">{{ formatDate(review.date) }}</span>
                      </div>
                      <p class="review-comment">{{ review.comment }}</p>
                    </ion-label>
                  </ion-item>
                }
              </ion-list>

              @if (reviews().length > 3) {
                <ion-button expand="block" fill="clear" (click)="viewAllReviews()">
                  View all {{ reviewsCount() }} reviews
                  <ion-icon slot="end" name="chevron-forward"></ion-icon>
                </ion-button>
              }
            }
          </ion-card-content>
        </ion-card>

        <!-- Write Review FAB -->
        @if (isAuthenticated()) {
          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button (click)="writeReview()">
              <ion-icon name="add"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        }
      }
    </ion-content>
  `,
  styles: [`
    .loading-container {
      padding: 0;
    }

    .skeleton-content {
      padding: 16px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      padding: 20px;
      text-align: center;

      ion-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
      }

      p {
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }
    }

    .hero-image {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .no-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ion-color-light);

        ion-icon {
          font-size: 64px;
          color: var(--ion-color-medium);
        }
      }

      .hero-overlay {
        position: absolute;
        bottom: 12px;
        left: 12px;
      }
    }

    .location-info {
      padding: 16px;

      h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
      }

      .rating-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .rating-text {
          font-weight: 600;
          font-size: 16px;
        }

        .reviews-count {
          color: var(--ion-color-medium);
          font-size: 14px;
        }
      }

      .address-row {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;

        ion-icon {
          font-size: 18px;
        }
      }

      .description {
        color: var(--ion-text-color);
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }

    ion-card {
      margin: 16px;

      ion-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .reviews-loading {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .no-reviews {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: var(--ion-color-medium);

      ion-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        text-align: center;
      }
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 16px;
    }

    ion-avatar {
      --border-radius: 50%;
      width: 40px;
      height: 40px;
    }

    .default-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ion-color-light);
      border-radius: 50%;

      ion-icon {
        font-size: 20px;
        color: var(--ion-color-medium);
      }
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;

      .review-date {
        font-size: 12px;
        color: var(--ion-color-medium);
      }
    }

    .review-comment {
      margin: 4px 0 0;
      white-space: pre-wrap;
    }

    ion-fab {
      margin-bottom: 16px;
      margin-right: 8px;
    }
  `],
})
export class LocationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private getLocationDetailUseCase = inject(GetLocationDetailUseCase);
  private authStateService = inject(AuthStateService);
  private favoriteRepository = inject(FAVORITE_REPOSITORY);
  private reviewRepository = inject(REVIEW_REPOSITORY);

  // State
  location = signal<LocationEntity | null>(null);
  reviews = signal<ReviewDisplay[]>([]);
  isLoading = signal(true);
  isLoadingReviews = signal(true);
  error = signal<string | null>(null);
  isFavorite = signal(false);

  // Computed
  isAuthenticated = computed(() => this.authStateService.isAuthenticated());
  currentUser = computed(() => this.authStateService.currentUser());
  reviewsCount = computed(() => this.reviews().length);

  constructor() {
    addIcons({
      heart,
      heartOutline,
      star,
      starOutline,
      location,
      navigate,
      share,
      call,
      globe,
      time,
      person,
      chatbubble,
      add,
      chevronForward,
      mapOutline,
    });
  }

  ngOnInit(): void {
    this.loadLocation();
  }

  async loadLocation(): Promise<void> {
    const locationId = this.route.snapshot.paramMap.get('id');
    if (!locationId) {
      this.error.set('Location ID not provided');
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
    } else {
      this.error.set(result.error.message);
    }

    this.isLoading.set(false);
  }

  private async loadReviews(locationId: string): Promise<void> {
    this.isLoadingReviews.set(true);

    try {
      const result = await this.reviewRepository.getByLocationId(locationId);

      if (result.success && result.data) {
        const reviewDisplays: ReviewDisplay[] = result.data.map((review: ReviewEntity) => ({
          id: review.id,
          userName: 'User', // TODO: Fetch user name
          userAvatar: undefined,
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
          photos: review.photos,
        }));
        this.reviews.set(reviewDisplays);
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

  async toggleFavorite(): Promise<void> {
    const user = this.currentUser();
    const loc = this.location();

    if (!user) {
      const alert = await this.alertController.create({
        header: 'Login Required',
        message: 'Please login to add favorites',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Login', handler: () => this.router.navigate(['/auth/login']) },
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
          this.showToast('Removed from favorites');
        }
      } else {
        const result = await this.favoriteRepository.create(user.id, loc.id);
        if (result.success) {
          this.isFavorite.set(true);
          this.showToast('Added to favorites');
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      this.showToast('Failed to update favorite', 'danger');
    }
  }

  async shareLocation(): Promise<void> {
    const loc = this.location();
    if (!loc) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: loc.name,
          text: loc.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        this.showToast('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }

  openDirections(): void {
    const loc = this.location();
    if (!loc) return;

    const coords = loc.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
    window.open(url, '_blank');
  }

  showOnMap(): void {
    const loc = this.location();
    if (!loc) return;

    this.router.navigate(['/tabs/explore'], {
      queryParams: {
        lat: loc.coordinates.latitude,
        lng: loc.coordinates.longitude,
        locationId: loc.id,
      },
    });
  }

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

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      restaurant: 'tertiary',
      cafe: 'warning',
      bar: 'danger',
      park: 'success',
      museum: 'primary',
      landmark: 'secondary',
      shopping: 'medium',
      entertainment: 'tertiary',
    };
    return colors[category.toLowerCase()] || 'primary';
  }

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
