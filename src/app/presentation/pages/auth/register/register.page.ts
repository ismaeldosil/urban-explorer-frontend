import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { RegisterUseCase } from '@application/use-cases/auth';
import { Password } from '@core/value-objects/password.vo';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Crear Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="onSubmit()" class="register-form">
        <!-- Username -->
        <ion-item lines="none" class="input-item">
          <ion-icon name="person-outline" slot="start"></ion-icon>
          <ion-input
            type="text"
            placeholder="Nombre de usuario"
            [(ngModel)]="username"
            name="username"
            required
            minlength="3"
            maxlength="20"
            pattern="^[a-zA-Z0-9_]+$"
          ></ion-input>
        </ion-item>
        <p class="input-hint">3-20 caracteres. Solo letras, números y guiones bajos.</p>

        <!-- Email -->
        <ion-item lines="none" class="input-item">
          <ion-icon name="mail-outline" slot="start"></ion-icon>
          <ion-input
            type="email"
            placeholder="Email"
            [(ngModel)]="email"
            name="email"
            required
            autocomplete="email"
          ></ion-input>
        </ion-item>

        <!-- Password -->
        <ion-item lines="none" class="input-item">
          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
          <ion-input
            [type]="showPassword() ? 'text' : 'password'"
            placeholder="Contraseña"
            [(ngModel)]="password"
            name="password"
            required
            autocomplete="new-password"
          ></ion-input>
          <ion-button fill="clear" slot="end" (click)="togglePassword()">
            <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Password Strength -->
        <div class="password-strength" *ngIf="password">
          <div class="strength-bars">
            <div
              *ngFor="let i of [0,1,2,3]"
              class="bar"
              [class.active]="i < passwordStrength().score"
              [style.background-color]="i < passwordStrength().score ? getStrengthColor() : '#E0E0E0'"
            ></div>
          </div>
          <span class="strength-label" [style.color]="getStrengthColor()">
            {{ passwordStrength().label }}
          </span>
        </div>

        <!-- Confirm Password -->
        <ion-item lines="none" class="input-item">
          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
          <ion-input
            [type]="showPassword() ? 'text' : 'password'"
            placeholder="Confirmar contraseña"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required
          ></ion-input>
        </ion-item>
        <p *ngIf="confirmPassword && password !== confirmPassword" class="error-text">
          Las contraseñas no coinciden
        </p>

        <!-- Terms -->
        <ion-item lines="none" class="terms-item">
          <ion-checkbox [(ngModel)]="acceptTerms" name="acceptTerms"></ion-checkbox>
          <ion-label>
            Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a>
          </ion-label>
        </ion-item>

        <ion-button
          expand="block"
          type="submit"
          [disabled]="isLoading() || !isFormValid()"
          class="submit-btn"
        >
          <ion-spinner *ngIf="isLoading()" name="crescent"></ion-spinner>
          <span *ngIf="!isLoading()">Crear Cuenta</span>
        </ion-button>
      </form>

      <p class="login-link">
        ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a>
      </p>
    </ion-content>
  `,
  styles: [`
    .register-form {
      padding-top: 16px;
    }
    .input-item {
      --background: #F5F5F5;
      --border-radius: 12px;
      margin-bottom: 8px;
      --padding-start: 16px;
    }
    .input-item ion-icon[slot="start"] {
      color: var(--ion-color-medium);
      margin-right: 12px;
    }
    .input-hint {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin: 0 0 16px 4px;
    }
    .password-strength {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 8px 0 16px 4px;
    }
    .strength-bars {
      display: flex;
      gap: 4px;
    }
    .bar {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: #E0E0E0;
      transition: background-color 0.2s;
    }
    .strength-label {
      font-size: 12px;
      font-weight: 500;
    }
    .error-text {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin: 0 0 16px 4px;
    }
    .terms-item {
      --background: transparent;
      margin: 16px 0;
    }
    .terms-item ion-label {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin-left: 12px;
    }
    .terms-item a {
      color: var(--ion-color-primary);
      text-decoration: none;
    }
    .submit-btn {
      margin-top: 24px;
      --border-radius: 12px;
      height: 48px;
      font-weight: 600;
    }
    .login-link {
      text-align: center;
      margin-top: 24px;
      color: var(--ion-color-medium);
    }
    .login-link a {
      color: var(--ion-color-primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class RegisterPage {
  private router = inject(Router);
  private toastController = inject(ToastController);
  private registerUseCase = inject(RegisterUseCase);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  showPassword = signal(false);
  isLoading = signal(false);

  passwordStrength = computed(() => Password.getStrength(this.password));

  isFormValid(): boolean {
    return (
      this.username.length >= 3 &&
      this.email.length > 0 &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword &&
      this.acceptTerms
    );
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  getStrengthColor(): string {
    const colors: Record<string, string> = {
      'danger': '#DC3545',
      'warning': '#FFC107',
      'success': '#28A745',
    };
    return colors[this.passwordStrength().color] || '#E0E0E0';
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);

    const result = await this.registerUseCase.execute({
      username: this.username,
      email: this.email,
      password: this.password,
    });

    this.isLoading.set(false);

    if (result.success) {
      const toast = await this.toastController.create({
        message: '¡Cuenta creada! Revisa tu email para verificar.',
        duration: 3000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
      this.router.navigate(['/auth/verify-email']);
    } else {
      const toast = await this.toastController.create({
        message: result.error.message,
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }
}
