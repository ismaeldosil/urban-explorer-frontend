import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-content">
        <div class="icon-container">
          <ion-icon [name]="icon"></ion-icon>
        </div>
        <h3 class="title">{{ title }}</h3>
        <p class="description">{{ description }}</p>
        <ion-button
          *ngIf="buttonText"
          [color]="buttonColor"
          (click)="onButtonClick()"
        >
          {{ buttonText }}
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      min-height: 300px;
    }
    .empty-state-content {
      max-width: 400px;
      text-align: center;
    }
    .icon-container {
      margin-bottom: 24px;
    }
    .icon-container ion-icon {
      font-size: 80px;
      color: var(--ion-color-medium);
      opacity: 0.6;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: var(--ion-text-color);
      margin: 0 0 12px 0;
    }
    .description {
      font-size: 16px;
      color: var(--ion-color-medium);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    ion-button {
      margin-top: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon = 'information-circle-outline';
  @Input() title = '';
  @Input() description = '';
  @Input() buttonText?: string;
  @Input() buttonColor: string = 'primary';

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
