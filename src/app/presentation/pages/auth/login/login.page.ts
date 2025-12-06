import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { LoginUseCase } from '@application/use-cases/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <img src="assets/logo.svg" alt="Urban Explorer" class="logo" />
          <h1>Urban Explorer</h1>
          <p class="tagline">Tu ciudad. Tu aventura.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
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

          <ion-item lines="none" class="input-item">
            <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
            <ion-input
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="Contraseña"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            ></ion-input>
            <ion-button fill="clear" slot="end" (click)="togglePassword()">
              <ion-icon [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-button
            expand="block"
            type="submit"
            [disabled]="isLoading() || !isFormValid()"
            class="submit-btn"
          >
            <ion-spinner *ngIf="isLoading()" name="crescent"></ion-spinner>
            <span *ngIf="!isLoading()">Iniciar Sesión</span>
          </ion-button>

          <a routerLink="/auth/forgot-password" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </a>
        </form>

        <div class="divider">
          <span>o</span>
        </div>

        <div class="social-buttons">
          <ion-button expand="block" fill="outline" (click)="loginWithGoogle()">
            <ion-icon name="logo-google" slot="start"></ion-icon>
            Continuar con Google
          </ion-button>
          <ion-button expand="block" fill="outline" (click)="loginWithApple()" class="apple-btn">
            <ion-icon name="logo-apple" slot="start"></ion-icon>
            Continuar con Apple
          </ion-button>
        </div>

        <p class="register-link">
          ¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 24px 0;
    }
    .logo-section {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      width: 120px;
      height: 120px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--ion-text-color);
      margin: 0 0 8px 0;
    }
    .tagline {
      color: var(--ion-color-medium);
      font-size: 16px;
      margin: 0;
    }
    .login-form {
      margin-bottom: 24px;
    }
    .input-item {
      --background: #F5F5F5;
      --border-radius: 12px;
      margin-bottom: 16px;
      --padding-start: 16px;
      --inner-padding-end: 8px;
    }
    .input-item ion-icon[slot="start"] {
      color: var(--ion-color-medium);
      margin-right: 12px;
    }
    .submit-btn {
      margin-top: 8px;
      --border-radius: 12px;
      height: 48px;
      font-weight: 600;
    }
    .forgot-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      color: var(--ion-color-primary);
      text-decoration: none;
      font-size: 14px;
    }
    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #E0E0E0;
    }
    .divider span {
      padding: 0 16px;
      color: var(--ion-color-medium);
      font-size: 14px;
    }
    .social-buttons ion-button {
      margin-bottom: 12px;
      --border-radius: 12px;
      height: 48px;
    }
    .apple-btn {
      --color: #000;
      --border-color: #000;
    }
    .register-link {
      text-align: center;
      margin-top: 24px;
      color: var(--ion-color-medium);
    }
    .register-link a {
      color: var(--ion-color-primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class LoginPage {
  private router = inject(Router);
  private toastController = inject(ToastController);
  private loginUseCase = inject(LoginUseCase);

  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);

  isFormValid(): boolean {
    return this.email.length > 0 && this.password.length > 0;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);

    const result = await this.loginUseCase.execute({
      email: this.email,
      password: this.password,
    });

    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/tabs/explore']);
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

  async loginWithGoogle(): Promise<void> {
    // TODO: Implement Google OAuth
  }

  async loginWithApple(): Promise<void> {
    // TODO: Implement Apple OAuth
  }
}
