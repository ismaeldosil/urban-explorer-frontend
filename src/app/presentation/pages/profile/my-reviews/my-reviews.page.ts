import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonContent,
    IonBackButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Mis Reviews</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="coming-soon">
        <ion-icon name="create-outline"></ion-icon>
        <h2>Proximamente</h2>
        <p>Aqui podras ver todas tus reviews</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--ion-color-medium);
      text-align: center;
    }
    .coming-soon ion-icon {
      font-size: 80px;
      margin-bottom: 24px;
    }
    .coming-soon h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .coming-soon p {
      font-size: 16px;
      margin: 0;
    }
  `]
})
export class MyReviewsPage {
  constructor() {
    addIcons({ arrowBackOutline, createOutline });
  }
}
