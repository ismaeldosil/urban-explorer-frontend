import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent, IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { LocationCardComponent, LocationCardData } from '../../../components/location-card/location-card.component';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { FAVORITE_REPOSITORY } from '@infrastructure/di/tokens';
import { FavoriteWithLocation, SupabaseFavoriteRepository } from '@infrastructure/repositories/supabase-favorite.repository';
import { IFavoriteRepository } from '@core/repositories/favorite.repository';

type PageState = 'loading' | 'empty' | 'error' | 'loaded';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, IonicModule, LocationCardComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Favoritos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content
          pullingIcon="chevron-down-outline"
          pullingText="Desliza para actualizar"
          refreshingSpinner="crescent"
          refreshingText="Actualizando...">
        </ion-refresher-content>
      </ion-refresher>

      <!-- Loading State -->
      <div *ngIf="pageState() === 'loading'" class="state-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Cargando favoritos...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="pageState() === 'error'" class="state-container error">
        <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
        <h2>Error al cargar</h2>
        <p>{{ errorMessage() }}</p>
        <ion-button fill="outline" (click)="loadFavorites()">
          <ion-icon name="refresh-outline" slot="start"></ion-icon>
          Reintentar
        </ion-button>
      </div>

      <!-- Empty State -->
      <div *ngIf="pageState() === 'empty'" class="state-container empty">
        <ion-icon name="heart-outline"></ion-icon>
        <h2>Sin favoritos</h2>
        <p>Aun no tienes lugares guardados. Explora y agrega tus lugares preferidos.</p>
        <ion-button fill="solid" (click)="goToExplore()">
          <ion-icon name="compass-outline" slot="start"></ion-icon>
          Explorar lugares
        </ion-button>
      </div>

      <!-- Favorites List -->
      <ion-list *ngIf="pageState() === 'loaded'" class="favorites-list" lines="none">
        <ion-item-sliding *ngFor="let favorite of favorites(); trackBy: trackByFavorite" #slidingItem>
          <ion-item lines="none" class="favorite-item">
            <app-location-card
              [location]="mapToLocationCard(favorite)"
              [showFavorite]="false"
              [showDistance]="false"
              (cardClick)="onLocationClick($event)"
            ></app-location-card>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="removeFavorite(favorite, slidingItem)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Toast for feedback -->
      <ion-toast
        [isOpen]="showToast()"
        [message]="toastMessage()"
        [duration]="2000"
        [color]="toastColor()"
        position="bottom"
        (didDismiss)="showToast.set(false)"
      ></ion-toast>
    </ion-content>
  `,
  styles: [`
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .state-container ion-icon {
      font-size: 80px;
      margin-bottom: 24px;
    }
    .state-container h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--ion-color-dark);
    }
    .state-container p {
      font-size: 16px;
      margin: 0 0 24px 0;
      max-width: 280px;
    }
    .state-container.error ion-icon {
      color: var(--ion-color-danger);
    }
    .state-container.empty ion-icon {
      color: var(--ion-color-primary);
      opacity: 0.6;
    }
    .favorites-list {
      padding: 8px 16px;
      background: transparent;
    }
    .favorite-item {
      --padding-start: 0;
      --padding-end: 0;
      --inner-padding-end: 0;
      --background: transparent;
    }
    .favorite-item app-location-card {
      width: 100%;
    }
    ion-item-sliding {
      margin-bottom: 8px;
    }
    ion-item-option {
      width: 72px;
    }
    ion-spinner {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class FavoritesPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly favoriteRepository = inject(FAVORITE_REPOSITORY) as IFavoriteRepository;

  // State signals
  readonly favorites = signal<FavoriteWithLocation[]>([]);
  readonly pageState = signal<PageState>('loading');
  readonly errorMessage = signal<string>('');
  readonly showToast = signal(false);
  readonly toastMessage = signal('');
  readonly toastColor = signal<'success' | 'danger'>('success');

  // Computed
  readonly userId = computed(() => this.authState.currentUser()?.id);

  ngOnInit(): void {
    this.loadFavorites();
  }

  async loadFavorites(): Promise<void> {
    const userId = this.userId();
    if (!userId) {
      this.pageState.set('error');
      this.errorMessage.set('Debes iniciar sesion para ver tus favoritos');
      return;
    }

    this.pageState.set('loading');

    try {
      const result = await this.favoriteRepository.getByUserId(userId);

      if (!result.success) {
        this.pageState.set('error');
        this.errorMessage.set(result.error?.message || 'Error desconocido');
        return;
      }

      const data = result.data as FavoriteWithLocation[];
      this.favorites.set(data);
      this.pageState.set(data.length === 0 ? 'empty' : 'loaded');
    } catch (error) {
      this.pageState.set('error');
      this.errorMessage.set('No se pudieron cargar los favoritos');
    }
  }

  async doRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.loadFavorites();
    event.target.complete();
  }

  async removeFavorite(favorite: FavoriteWithLocation, slidingItem: IonItemSliding): Promise<void> {
    const userId = this.userId();
    if (!userId) return;

    await slidingItem.close();

    try {
      const result = await this.favoriteRepository.delete(userId, favorite.locationId);

      if (result.success) {
        this.favorites.update(list => list.filter(f => f.id !== favorite.id));
        this.showFeedback('Eliminado de favoritos', 'success');

        if (this.favorites().length === 0) {
          this.pageState.set('empty');
        }
      } else {
        this.showFeedback('Error al eliminar', 'danger');
      }
    } catch {
      this.showFeedback('Error al eliminar', 'danger');
    }
  }

  mapToLocationCard(favorite: FavoriteWithLocation): LocationCardData {
    const loc = favorite.location;
    return {
      id: favorite.locationId,
      name: loc?.name || 'Lugar sin nombre',
      imageUrl: loc?.photos?.[0],
      rating: loc?.rating || 0,
      reviewCount: loc?.review_count || 0,
      priceLevel: (loc?.price_level || 1) as 1 | 2 | 3 | 4,
      category: loc?.category_name || 'Sin categoria',
    };
  }

  onLocationClick(location: LocationCardData): void {
    this.router.navigate(['/location', location.id]);
  }

  goToExplore(): void {
    this.router.navigate(['/tabs/explore']);
  }

  trackByFavorite(_: number, favorite: FavoriteWithLocation): string {
    return favorite.id;
  }

  private showFeedback(message: string, color: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }
}
