import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  template: `
    <ion-content class="ion-padding">
      <div class="verify-container">
        <div class="icon-wrapper">
          <ion-icon name="mail-outline"></ion-icon>
        </div>

        <h1>Revisa tu email</h1>

        <p class="description">
          Te hemos enviado un enlace de verificación a tu correo electrónico.
          Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
        </p>

        <div class="tips">
          <p><strong>No encuentras el email?</strong></p>
          <ul>
            <li>Revisa tu carpeta de spam</li>
            <li>Asegúrate de que el email esté bien escrito</li>
            <li>Espera unos minutos y vuelve a intentar</li>
          </ul>
        </div>

        <ion-button expand="block" routerLink="/auth/login" class="login-btn">
          Ir a Iniciar Sesión
        </ion-button>

        <p class="resend-text">
          ¿No recibiste el email? <a href="#" (click)="resendEmail($event)">Reenviar</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .verify-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      padding: 20px;
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--ion-color-primary-tint);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;

      ion-icon {
        font-size: 48px;
        color: var(--ion-color-primary);
      }
    }

    h1 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-text-color);
    }

    .description {
      color: var(--ion-color-medium);
      line-height: 1.6;
      margin: 0 0 32px;
      max-width: 300px;
    }

    .tips {
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 32px;
      text-align: left;
      width: 100%;
      max-width: 300px;

      p {
        margin: 0 0 8px;
        color: var(--ion-text-color);
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: var(--ion-color-medium);

        li {
          margin-bottom: 4px;
        }
      }
    }

    .login-btn {
      width: 100%;
      max-width: 300px;
      --border-radius: 12px;
      height: 48px;
      font-weight: 600;
    }

    .resend-text {
      margin-top: 24px;
      color: var(--ion-color-medium);

      a {
        color: var(--ion-color-primary);
        text-decoration: none;
        font-weight: 600;
      }
    }
  `]
})
export class VerifyEmailPage {
  resendEmail(event: Event): void {
    event.preventDefault();
    // TODO: Implement resend email functionality
    console.log('Resend email clicked');
  }
}
