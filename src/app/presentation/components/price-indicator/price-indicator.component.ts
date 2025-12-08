import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type PriceLevel = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-price-indicator',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="price-indicator" [class]="sizeClass">
      @for (i of priceSymbols; track i) {
        <span
          class="price-symbol"
          [class.active]="i <= level"
          [class.inactive]="i > level"
        >{{ symbol }}</span>
      }
      @if (showLabel) {
        <span class="price-label">{{ priceLabel }}</span>
      }
    </div>
  `,
  styles: [`
    .price-indicator {
      display: inline-flex;
      align-items: center;
      gap: 1px;
    }

    .price-symbol {
      font-weight: 700;
      transition: color 0.2s ease;

      &.active {
        color: var(--ion-color-success);
      }

      &.inactive {
        color: var(--ion-color-light-shade);
      }
    }

    .price-label {
      margin-left: 8px;
      color: var(--ion-color-medium);
      font-weight: 500;
    }

    /* Sizes */
    .size-sm {
      .price-symbol {
        font-size: 12px;
      }
      .price-label {
        font-size: 11px;
      }
    }

    .size-md {
      .price-symbol {
        font-size: 14px;
      }
      .price-label {
        font-size: 13px;
      }
    }

    .size-lg {
      .price-symbol {
        font-size: 18px;
      }
      .price-label {
        font-size: 15px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceIndicatorComponent {
  @Input() level: PriceLevel = 2;
  @Input() maxLevel: PriceLevel = 4;
  @Input() symbol = '$';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showLabel = false;

  readonly priceLabels: Record<PriceLevel, string> = {
    1: 'Económico',
    2: 'Moderado',
    3: 'Costoso',
    4: 'Muy costoso',
  };

  get priceSymbols(): number[] {
    return Array.from({ length: this.maxLevel }, (_, i) => i + 1);
  }

  get sizeClass(): string {
    return `size-${this.size}`;
  }

  get priceLabel(): string {
    return this.priceLabels[this.level] || '';
  }

  static fromAmount(amount: number, currency = 'USD'): PriceLevel {
    // Example thresholds for USD - adjust based on currency
    if (currency === 'USD') {
      if (amount < 15) return 1;
      if (amount < 30) return 2;
      if (amount < 60) return 3;
      return 4;
    }
    // Default thresholds
    if (amount < 500) return 1;
    if (amount < 1000) return 2;
    if (amount < 2000) return 3;
    return 4;
  }
}
