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
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonSkeletonText,
  IonSegment,
  IonSegmentButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person,
  star,
  starOutline,
  time,
  timeOutline,
  arrowDown,
  arrowUp,
  add,
  imageOutline,
} from 'ionicons/icons';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { ReviewEntity } from '@core/entities/review.entity';
import { GetLocationReviewsUseCase } from '@application/use-cases/reviews/get-location-reviews.usecase';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
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

type SortBy = 'date' | 'rating';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-location-reviews',
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
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonSkeletonText,
    IonSegment,
    IonSegmentButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="'/location/' + locationId"></ion-back-button>
        </ion-buttons>
        <ion-title>Reviews ({{ totalCount() }})</ion-title>
        @if (isAuthenticated()) {
          <ion-buttons slot="end">
            <ion-button (click)="writeReview()">
              <ion-icon slot="icon-only" name="add"></ion-icon>
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>

      <!-- Sort Controls -->
      <ion-toolbar>
        <ion-segment [value]="sortBy()" (ionChange)="onSortByChange($event)">
          <ion-segment-button value="date">
            <ion-icon name="time-outline"></ion-icon>
            Recientes
          </ion-segment-button>
          <ion-segment-button value="rating">
            <ion-icon name="star-outline"></ion-icon>
            Rating
          </ion-segment-button>
        </ion-segment>
        <ion-button slot="end" fill="clear" (click)="toggleSortOrder()">
          <ion-icon [name]="sortOrder() === 'desc' ? 'arrow-down' : 'arrow-up'"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Loading State -->
      @if (isLoading() && reviews().length === 0) {
        <ion-list>
          @for (i of [1,2,3,4,5]; track i) {
            <ion-item lines="none">
              <ion-avatar slot="start">
                <ion-skeleton-text [animated]="true"></ion-skeleton-text>
              </ion-avatar>
              <ion-label>
                <ion-skeleton-text [animated]="true" style="width: 40%;"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 60%; margin-top: 8px;"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 100%; height: 40px; margin-top: 8px;"></ion-skeleton-text>
              </ion-label>
            </ion-item>
          }
        </ion-list>
      }

      <!-- Empty State -->
      @if (!isLoading() && reviews().length === 0) {
        <div class="empty-state">
          <ion-icon name="star-outline"></ion-icon>
          <h2>Sin reviews</h2>
          <p>Este lugar aún no tiene reviews. ¡Sé el primero en dejar una!</p>
          @if (isAuthenticated()) {
            <ion-button (click)="writeReview()">
              <ion-icon slot="start" name="add"></ion-icon>
              Escribir Review
            </ion-button>
          }
        </div>
      }

      <!-- Reviews List -->
      @if (reviews().length > 0) {
        <ion-list>
          @for (review of reviews(); track review.id) {
            <div class="review-item">
              <div class="review-header">
                <ion-avatar>
                  @if (review.userAvatar) {
                    <img [src]="review.userAvatar" />
                  } @else {
                    <div class="default-avatar">
                      <ion-icon name="person"></ion-icon>
                    </div>
                  }
                </ion-avatar>
                <div class="review-meta">
                  <h3>{{ review.userName }}</h3>
                  <div class="review-info">
                    <app-star-rating [rating]="review.rating" [readonly]="true" [size]="'small'"></app-star-rating>
                    <span class="review-date">{{ formatDate(review.date) }}</span>
                  </div>
                </div>
              </div>

              <p class="review-comment">{{ review.comment }}</p>

              @if (review.photos.length > 0) {
                <div class="review-photos">
                  @for (photo of review.photos; track photo; let i = $index) {
                    @if (i < 3) {
                      <div class="photo-thumb" (click)="openPhoto(photo)">
                        <img [src]="photo" [alt]="'Review photo ' + (i + 1)" />
                      </div>
                    }
                  }
                  @if (review.photos.length > 3) {
                    <div class="photo-more" (click)="openPhotos(review.photos)">
                      <ion-icon name="image-outline"></ion-icon>
                      <span>+{{ review.photos.length - 3 }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </ion-list>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)" [disabled]="!hasMore()">
          <ion-infinite-scroll-content
            loadingSpinner="crescent"
            loadingText="Cargando más reviews...">
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
      }
    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      padding: 20px;
      text-align: center;

      ion-icon {
        font-size: 64px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
        color: var(--ion-text-color);
      }

      p {
        margin: 0 0 24px;
        color: var(--ion-color-medium);
        max-width: 280px;
      }
    }

    ion-segment {
      --background: transparent;
    }

    ion-segment-button {
      --indicator-height: 3px;
    }

    .review-item {
      padding: 16px;
      border-bottom: 1px solid var(--ion-color-light);
    }

    .review-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    ion-avatar {
      --border-radius: 50%;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
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
        font-size: 22px;
        color: var(--ion-color-medium);
      }
    }

    .review-meta {
      flex: 1;

      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
      }

      .review-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .review-date {
          font-size: 12px;
          color: var(--ion-color-medium);
        }
      }
    }

    .review-comment {
      margin: 0 0 12px;
      color: var(--ion-text-color);
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .review-photos {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .photo-thumb {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .photo-more {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      background: var(--ion-color-light);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;

      ion-icon {
        font-size: 24px;
        color: var(--ion-color-medium);
      }

      span {
        font-size: 14px;
        color: var(--ion-color-medium);
        font-weight: 600;
      }
    }

    ion-list {
      padding: 0;
    }
  `],
})
export class LocationReviewsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getLocationReviewsUseCase = inject(GetLocationReviewsUseCase);
  private authStateService = inject(AuthStateService);

  // State
  reviews = signal<ReviewDisplay[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  hasMore = signal(false);
  sortBy = signal<SortBy>('date');
  sortOrder = signal<SortOrder>('desc');
  locationId = '';

  private readonly PAGE_SIZE = 10;
  private currentOffset = 0;

  // Computed
  isAuthenticated = computed(() => this.authStateService.isAuthenticated());

  constructor() {
    addIcons({
      person,
      star,
      starOutline,
      time,
      timeOutline,
      arrowDown,
      arrowUp,
      add,
      imageOutline,
    });
  }

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadReviews();
  }

  async loadReviews(reset = true): Promise<void> {
    if (reset) {
      this.currentOffset = 0;
      this.isLoading.set(true);
    }

    const result = await this.getLocationReviewsUseCase.execute({
      locationId: this.locationId,
      limit: this.PAGE_SIZE,
      offset: this.currentOffset,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    });

    if (result.success && result.data) {
      const newReviews = result.data.data.map((review: ReviewEntity) => ({
        id: review.id,
        userName: 'Usuario', // TODO: Get from profiles join
        userAvatar: undefined,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        photos: review.photos,
      }));

      if (reset) {
        this.reviews.set(newReviews);
      } else {
        this.reviews.update(current => [...current, ...newReviews]);
      }

      this.totalCount.set(result.data.totalCount);
      this.hasMore.set(result.data.hasMore);
    }

    this.isLoading.set(false);
  }

  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    this.currentOffset += this.PAGE_SIZE;
    await this.loadReviews(false);
    event.target.complete();
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.loadReviews(true);
    event.target.complete();
  }

  onSortByChange(event: CustomEvent): void {
    this.sortBy.set(event.detail.value as SortBy);
    this.loadReviews(true);
  }

  toggleSortOrder(): void {
    this.sortOrder.update(current => current === 'desc' ? 'asc' : 'desc');
    this.loadReviews(true);
  }

  writeReview(): void {
    this.router.navigate(['/location', this.locationId, 'review']);
  }

  openPhoto(photoUrl: string): void {
    // TODO: Implement photo viewer modal
    console.log('Open photo:', photoUrl);
  }

  openPhotos(photos: string[]): void {
    // TODO: Implement photo gallery modal
    console.log('Open photos:', photos);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
  }
}
