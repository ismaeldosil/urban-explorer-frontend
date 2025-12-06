import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonSpinner,
  AlertController,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  personOutline,
  createOutline,
  starOutline,
  chevronForwardOutline,
  logOutOutline,
  mapOutline,
  ribbonOutline,
  locationOutline,
  chatbubblesOutline,
  trophyOutline,
  shieldCheckmarkOutline,
  cameraOutline,
  flashOutline,
} from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { LogoutUseCase } from '@application/use-cases/auth/logout.usecase';
import { BadgeEntity } from '@core/entities/badge.entity';

interface UserStats {
  placesVisited: number;
  reviewsWritten: number;
  totalPoints: number;
}

interface UserBadge extends BadgeEntity {
  earnedAt?: Date;
  progress?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  // User state from AuthStateService
  readonly currentUser = this.authState.currentUser;
  readonly isLoading = this.authState.isLoading;

  // Stats signal (would come from a service/repository in production)
  readonly stats = signal<UserStats>({
    placesVisited: 0,
    reviewsWritten: 0,
    totalPoints: 0,
  });

  // Badges signal (would come from a service/repository in production)
  readonly badges = signal<UserBadge[]>([]);

  // Computed values
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (user) {
      return user.getInitials();
    }
    return 'UE';
  });

  readonly displayName = computed(() => {
    const user = this.currentUser();
    return user?.username ?? 'Usuario';
  });

  readonly userEmail = computed(() => {
    const user = this.currentUser();
    return user?.email.value ?? '';
  });

  readonly userLocation = computed(() => {
    const user = this.currentUser();
    return user?.location ?? 'Sin ubicacion';
  });

  readonly memberSince = computed(() => {
    const user = this.currentUser();
    if (user?.createdAt) {
      return this.formatDate(user.createdAt);
    }
    return '';
  });

  readonly hasBadges = computed(() => this.badges().length > 0);

  constructor() {
    addIcons({
      settingsOutline,
      personOutline,
      createOutline,
      starOutline,
      chevronForwardOutline,
      logOutOutline,
      mapOutline,
      ribbonOutline,
      locationOutline,
      chatbubblesOutline,
      trophyOutline,
      shieldCheckmarkOutline,
      cameraOutline,
      flashOutline,
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.loadUserData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private async loadUserData(): Promise<void> {
    // TODO: Replace with actual API calls when repositories are ready
    // For now, we simulate some data
    this.stats.set({
      placesVisited: 12,
      reviewsWritten: 8,
      totalPoints: 450,
    });

    // Sample badges - would come from API
    this.badges.set([
      {
        id: '1',
        name: 'Explorador Novato',
        description: 'Visitaste tu primer lugar',
        iconUrl: '',
        requiredCount: 1,
        type: 'visit',
        createdAt: new Date(),
        earnedAt: new Date(),
        progress: 100,
      },
      {
        id: '2',
        name: 'Critico Nato',
        description: 'Escribiste 5 reviews',
        iconUrl: '',
        requiredCount: 5,
        type: 'review',
        createdAt: new Date(),
        earnedAt: new Date(),
        progress: 100,
      },
      {
        id: '3',
        name: 'Trotamundos',
        description: 'Visita 20 lugares',
        iconUrl: '',
        requiredCount: 20,
        type: 'visit',
        createdAt: new Date(),
        progress: 60,
      },
    ]);
  }

  async onLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar sesion',
      message: 'Estas seguro de que quieres cerrar sesion?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesion',
          role: 'destructive',
          handler: async () => {
            await this.performLogout();
          },
        },
      ],
    });

    await alert.present();
  }

  private async performLogout(): Promise<void> {
    const result = await this.logoutUseCase.execute();

    if (result.success) {
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: result.error?.message ?? 'No se pudo cerrar sesion',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  navigateToMyReviews(): void {
    this.router.navigate(['/profile/my-reviews']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/profile/settings']);
  }

  getBadgeIcon(type: string): string {
    switch (type) {
      case 'visit':
        return 'location-outline';
      case 'review':
        return 'chatbubbles-outline';
      case 'favorite':
        return 'star-outline';
      default:
        return 'ribbon-outline';
    }
  }

  getBadgeColor(type: string): string {
    switch (type) {
      case 'visit':
        return 'primary';
      case 'review':
        return 'secondary';
      case 'favorite':
        return 'warning';
      default:
        return 'medium';
    }
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
