import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Recuperar Contraseña</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="forgot-password-container">
        <div class="icon-section">
          <ion-icon name="mail-outline" class="mail-icon"></ion-icon>
        </div>

        <h2>¿Olvidaste tu contraseña?</h2>
        <p class="description">
          No te preocupes. Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form (ngSubmit)="onSubmit()" class="forgot-form">
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

          <ion-button
            expand="block"
            type="submit"
            [disabled]="isLoading() || !isFormValid()"
            class="submit-btn"
          >
            <ion-spinner *ngIf="isLoading()" name="crescent"></ion-spinner>
            <span *ngIf="!isLoading()">Enviar Enlace</span>
          </ion-button>
        </form>

        <p class="back-link">
          <a routerLink="/auth/login">
            <ion-icon name="arrow-back-outline"></ion-icon>
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .forgot-password-container {
      display: flex;
      flex-direction: column;
      padding: 24px 0;
    }
    .icon-section {
      text-align: center;
      margin-bottom: 24px;
    }
    .mail-icon {
      font-size: 80px;
      color: var(--ion-color-primary);
    }
    h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-text-color);
      text-align: center;
      margin: 0 0 16px 0;
    }
    .description {
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 16px;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    .forgot-form {
      margin-bottom: 24px;
    }
    .input-item {
      --background: #F5F5F5;
      --border-radius: 12px;
      margin-bottom: 16px;
      --padding-start: 16px;
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
    .back-link {
      text-align: center;
      margin-top: 24px;
    }
    .back-link a {
      color: var(--ion-color-primary);
      text-decoration: none;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .back-link ion-icon {
      font-size: 16px;
    }
  `]
})
export class ForgotPasswordPage {
  private router = inject(Router);
  private toastController = inject(ToastController);

  email = '';
  isLoading = signal(false);

  isFormValid(): boolean {
    return this.email.length > 0 && this.email.includes('@');
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);

    // TODO: Implement forgot password use case
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.isLoading.set(false);

    const toast = await this.toastController.create({
      message: 'Enlace de recuperación enviado. Revisa tu email.',
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();

    this.router.navigate(['/auth/login']);
  }
}
