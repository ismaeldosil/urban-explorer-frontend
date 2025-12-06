import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterOutlet],
  template: `
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="explore" href="/tabs/explore">
          <ion-icon name="compass-outline"></ion-icon>
          <ion-label>Explorar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon name="search-outline"></ion-icon>
          <ion-label>Buscar</ion-label>
        </ion-tab-button>

        <ion-tab-button (click)="openAddOptions($event)">
          <ion-icon name="add-circle-outline"></ion-icon>
          <ion-label>Agregar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="favorites" href="/tabs/favorites">
          <ion-icon name="heart-outline"></ion-icon>
          <ion-label>Favoritos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: #FFFFFF;
      --border: 1px solid #E5E5E5;
      height: calc(56px + env(safe-area-inset-bottom));
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    }
    ion-tab-button {
      --color: #666666;
      --color-selected: var(--ion-color-primary);
    }
    ion-tab-button ion-icon {
      font-size: 24px;
    }
    ion-tab-button ion-label {
      font-size: 11px;
      font-weight: 500;
      margin-top: 2px;
    }
  `]
})
export class TabsPage {
  private actionSheetController = inject(ActionSheetController);
  private router = inject(Router);

  async openAddOptions(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const actionSheet = await this.actionSheetController.create({
      header: 'Agregar contenido',
      buttons: [
        {
          text: 'Agregar lugar',
          icon: 'location',
          handler: () => {
            this.router.navigate(['/add-location']);
          }
        },
        {
          text: 'Escribir review',
          icon: 'create',
          handler: () => {
            this.router.navigate(['/tabs/search'], {
              queryParams: { mode: 'select-for-review' }
            });
          }
        },
        {
          text: 'Crear ruta',
          icon: 'map',
          handler: () => {
            this.router.navigate(['/create-route']);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
}
