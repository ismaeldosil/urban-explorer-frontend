import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordAnalysis {
  strength: PasswordStrength;
  score: number;
  requirements: PasswordRequirement[];
}

@Component({
  selector: 'app-password-strength-indicator',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="password-strength-container">
      <div class="strength-bars">
        @for (i of bars; track i) {
          <div
            class="bar"
            [class.filled]="i <= analysis().score"
            [class]="'strength-' + analysis().strength"
          ></div>
        }
      </div>

      <div class="strength-label" [class]="'strength-' + analysis().strength">
        {{ strengthLabel() }}
      </div>

      @if (showRequirements) {
        <div class="requirements-list">
          @for (req of analysis().requirements; track req.id) {
            <div class="requirement" [class.met]="req.met">
              <ion-icon
                [name]="req.met ? 'checkmark-circle' : 'close-circle'"
              ></ion-icon>
              <span>{{ req.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .password-strength-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .strength-bars {
      display: flex;
      gap: 4px;
    }

    .bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: var(--ion-color-light-shade);
      transition: background-color 0.3s ease;
    }

    .bar.filled.strength-weak {
      background: #ef4444;
    }

    .bar.filled.strength-fair {
      background: #f59e0b;
    }

    .bar.filled.strength-good {
      background: #10b981;
    }

    .bar.filled.strength-strong {
      background: #059669;
    }

    .strength-label {
      font-size: 12px;
      font-weight: 500;
      text-align: right;
    }

    .strength-label.strength-weak {
      color: #ef4444;
    }

    .strength-label.strength-fair {
      color: #f59e0b;
    }

    .strength-label.strength-good {
      color: #10b981;
    }

    .strength-label.strength-strong {
      color: #059669;
    }

    .requirements-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--ion-color-medium);
      transition: color 0.2s ease;

      ion-icon {
        font-size: 16px;
        color: #ef4444;
      }

      &.met {
        color: var(--ion-color-dark);

        ion-icon {
          color: #10b981;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthIndicatorComponent implements OnChanges {
  @Input() password = '';
  @Input() showRequirements = true;
  @Input() minLength = 8;

  readonly bars = [1, 2, 3, 4];

  private readonly passwordSignal = signal('');

  readonly analysis = computed<PasswordAnalysis>(() => {
    const pwd = this.passwordSignal();
    return this.analyzePassword(pwd);
  });

  readonly strengthLabel = computed(() => {
    const strength = this.analysis().strength;
    const labels: Record<PasswordStrength, string> = {
      weak: 'Muy Débil',
      fair: 'Débil',
      good: 'Buena',
      strong: 'Excelente',
    };
    return labels[strength];
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.passwordSignal.set(this.password);
    }
  }

  private analyzePassword(password: string): PasswordAnalysis {
    const requirements: PasswordRequirement[] = [
      {
        id: 'length',
        label: `Al menos ${this.minLength} caracteres`,
        met: password.length >= this.minLength,
      },
      {
        id: 'lowercase',
        label: 'Una letra minúscula',
        met: /[a-z]/.test(password),
      },
      {
        id: 'uppercase',
        label: 'Una letra mayúscula',
        met: /[A-Z]/.test(password),
      },
      {
        id: 'number',
        label: 'Un número',
        met: /\d/.test(password),
      },
      {
        id: 'special',
        label: 'Un carácter especial (!@#$%...)',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
    ];

    const metCount = requirements.filter((r) => r.met).length;
    const score = this.calculateScore(password, metCount);
    const strength = this.getStrengthFromScore(score);

    return { strength, score, requirements };
  }

  private calculateScore(password: string, metRequirements: number): number {
    if (!password) return 0;

    let score = 0;

    // Base score from met requirements
    score += metRequirements;

    // Bonus for length beyond minimum
    if (password.length >= this.minLength + 4) score += 0.5;
    if (password.length >= this.minLength + 8) score += 0.5;

    // Cap at 4
    return Math.min(4, Math.floor(score));
  }

  private getStrengthFromScore(score: number): PasswordStrength {
    if (score <= 1) return 'weak';
    if (score === 2) return 'fair';
    if (score === 3) return 'good';
    return 'strong';
  }

  static validatePassword(
    password: string,
    minLength = 8
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < minLength) {
      errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe incluir al menos una letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe incluir al menos una letra mayúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe incluir al menos un número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Debe incluir al menos un carácter especial');
    }

    return { isValid: errors.length === 0, errors };
  }
}
