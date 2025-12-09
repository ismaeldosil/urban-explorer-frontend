import {
  Component,
  Input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { SearchFilters } from '@core/repositories/location.repository';

export interface SearchFilterData {
  filters: SearchFilters;
  categories: { id: string; name: string; icon: string }[];
}

@Component({
  selector: 'app-search-filter-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Filtros</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="resetFilters()">
            Limpiar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Category filter -->
      <div class="filter-section">
        <h3 class="section-title">Categoria</h3>
        <div class="category-grid">
          @for (cat of categories; track cat.id) {
            <button
              class="category-chip"
              [class.active]="selectedCategory() === cat.id"
              (click)="selectCategory(cat.id)"
            >
              <ion-icon [name]="cat.icon"></ion-icon>
              <span>{{ cat.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Rating filter -->
      <div class="filter-section">
        <h3 class="section-title">Rating minimo</h3>
        <div class="rating-options">
          @for (rating of ratingOptions; track rating) {
            <button
              class="rating-chip"
              [class.active]="minRating() === rating"
              (click)="selectRating(rating)"
            >
              <ion-icon name="star" color="warning"></ion-icon>
              <span>{{ rating }}+</span>
            </button>
          }
        </div>
      </div>

      <!-- Price level filter -->
      <div class="filter-section">
        <h3 class="section-title">Nivel de precio</h3>
        <div class="price-options">
          @for (level of priceLevels; track level.value) {
            <button
              class="price-chip"
              [class.active]="maxPrice() === level.value"
              (click)="selectPrice(level.value)"
            >
              {{ level.label }}
            </button>
          }
        </div>
      </div>

      <!-- Open now toggle -->
      <div class="filter-section">
        <ion-item lines="none" class="toggle-item">
          <ion-label>
            <h3>Solo abiertos ahora</h3>
            <p>Mostrar unicamente lugares que esten abiertos</p>
          </ion-label>
          <ion-toggle
            [checked]="openNow()"
            (ionChange)="toggleOpenNow($event)"
          ></ion-toggle>
        </ion-item>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="applyFilters()">
          Aplicar filtros
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .filter-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--ue-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 12px 0;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .category-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--ue-bg-light);
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      ion-icon {
        font-size: 20px;
        color: var(--ue-text-secondary);
      }

      span {
        font-size: 14px;
        font-weight: 500;
        color: var(--ue-text-primary);
      }

      &.active {
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        border-color: var(--ion-color-primary);

        ion-icon, span {
          color: var(--ion-color-primary);
        }
      }
    }

    .rating-options,
    .price-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .rating-chip,
    .price-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 16px;
      background: var(--ue-bg-light);
      border: 2px solid transparent;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;

      ion-icon {
        font-size: 16px;
      }

      span {
        font-size: 14px;
        font-weight: 500;
        color: var(--ue-text-primary);
      }

      &.active {
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        border-color: var(--ion-color-primary);

        span {
          color: var(--ion-color-primary);
        }
      }
    }

    .toggle-item {
      --background: var(--ue-bg-light);
      --padding-start: 16px;
      --padding-end: 16px;
      border-radius: 12px;

      h3 {
        font-size: 16px;
        font-weight: 500;
        margin: 0;
      }

      p {
        font-size: 13px;
        color: var(--ue-text-secondary);
        margin: 4px 0 0;
      }
    }

    ion-footer ion-toolbar {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 8px;
      --padding-bottom: calc(var(--ion-safe-area-bottom, 0px) + 8px);
    }
  `],
})
export class SearchFilterModalComponent {
  @Input() initialFilters: SearchFilters = {};
  @Input() categories: { id: string; name: string; icon: string }[] = [];

  readonly selectedCategory = signal<string | undefined>(undefined);
  readonly minRating = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined);
  readonly openNow = signal(false);

  readonly ratingOptions = [3, 3.5, 4, 4.5];
  readonly priceLevels = [
    { value: 1, label: '$' },
    { value: 2, label: '$$' },
    { value: 3, label: '$$$' },
    { value: 4, label: '$$$$' },
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
    if (this.initialFilters) {
      this.selectedCategory.set(this.initialFilters.categoryId);
      this.minRating.set(this.initialFilters.minRating);
      this.maxPrice.set(this.initialFilters.maxPriceLevel);
      this.openNow.set(this.initialFilters.openNow ?? false);
    }
  }

  selectCategory(id: string): void {
    this.selectedCategory.update(current => current === id ? undefined : id);
  }

  selectRating(rating: number): void {
    this.minRating.update(current => current === rating ? undefined : rating);
  }

  selectPrice(level: number): void {
    this.maxPrice.update(current => current === level ? undefined : level);
  }

  toggleOpenNow(event: CustomEvent): void {
    this.openNow.set(event.detail.checked);
  }

  resetFilters(): void {
    this.selectedCategory.set(undefined);
    this.minRating.set(undefined);
    this.maxPrice.set(undefined);
    this.openNow.set(false);
  }

  dismiss(): void {
    this.modalController.dismiss();
  }

  applyFilters(): void {
    const filters: SearchFilters = {};

    if (this.selectedCategory()) {
      filters.categoryId = this.selectedCategory();
    }
    if (this.minRating()) {
      filters.minRating = this.minRating();
    }
    if (this.maxPrice()) {
      filters.maxPriceLevel = this.maxPrice();
    }
    if (this.openNow()) {
      filters.openNow = true;
    }

    this.modalController.dismiss(filters, 'apply');
  }
}
