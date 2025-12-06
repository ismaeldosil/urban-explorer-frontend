import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonBackButton,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonAvatar,
  IonSpinner,
  IonText,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  camera,
  checkmark,
  locationOutline,
  mailOutline,
  createOutline,
} from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { USER_REPOSITORY } from '@infrastructure/di/tokens';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonBackButton,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonAvatar,
    IonSpinner,
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button
            [disabled]="!hasChanges() || isSaving()"
            (click)="saveProfile()"
            [strong]="true"
          >
            @if (isSaving()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              <ion-icon slot="icon-only" name="checkmark"></ion-icon>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isLoading()) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else {
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container" (click)="changeAvatar()">
            <ion-avatar>
              @if (avatarUrl()) {
                <img [src]="avatarUrl()" alt="Profile photo" />
              } @else {
                <div class="avatar-placeholder">
                  <ion-icon name="person-outline"></ion-icon>
                </div>
              }
            </ion-avatar>
            <div class="avatar-overlay">
              <ion-icon name="camera"></ion-icon>
            </div>
          </div>
          <ion-button fill="clear" size="small" (click)="changeAvatar()">
            Change Photo
          </ion-button>
        </div>

        <!-- Form -->
        <ion-list lines="full">
          <!-- Username -->
          <ion-item>
            <ion-icon name="person-outline" slot="start" color="medium"></ion-icon>
            <ion-input
              label="Username"
              labelPlacement="stacked"
              [(ngModel)]="username"
              placeholder="Enter username"
              [maxlength]="20"
              [minlength]="3"
              (ionInput)="onInputChange()"
            ></ion-input>
          </ion-item>
          @if (usernameError()) {
            <div class="field-error">
              <ion-text color="danger">{{ usernameError() }}</ion-text>
            </div>
          }

          <!-- Email (readonly) -->
          <ion-item>
            <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
            <ion-input
              label="Email"
              labelPlacement="stacked"
              [value]="email()"
              [readonly]="true"
              class="readonly-input"
            ></ion-input>
          </ion-item>

          <!-- Location -->
          <ion-item>
            <ion-icon name="location-outline" slot="start" color="medium"></ion-icon>
            <ion-input
              label="Location"
              labelPlacement="stacked"
              [(ngModel)]="location"
              placeholder="e.g., Buenos Aires, Argentina"
              [maxlength]="100"
              (ionInput)="onInputChange()"
            ></ion-input>
          </ion-item>

          <!-- Bio -->
          <ion-item>
            <ion-icon name="create-outline" slot="start" color="medium"></ion-icon>
            <ion-textarea
              label="Bio"
              labelPlacement="stacked"
              [(ngModel)]="bio"
              placeholder="Tell us about yourself..."
              [rows]="4"
              [maxlength]="250"
              [autoGrow]="true"
              (ionInput)="onInputChange()"
            ></ion-textarea>
          </ion-item>
          <div class="char-count">
            <ion-text color="medium">{{ bio.length }}/250</ion-text>
          </div>
        </ion-list>

        <!-- Username Rules -->
        <div class="rules-section">
          <h4>Username rules</h4>
          <ul>
            <li [class.valid]="username.length >= 3">At least 3 characters</li>
            <li [class.valid]="username.length <= 20">Maximum 20 characters</li>
            <li [class.valid]="isValidUsernameFormat()">Only letters, numbers, and underscores</li>
          </ul>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50vh;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      background: var(--ion-color-light);
    }

    .avatar-container {
      position: relative;
      cursor: pointer;

      ion-avatar {
        width: 100px;
        height: 100px;
        --border-radius: 50%;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ion-color-medium);
        border-radius: 50%;

        ion-icon {
          font-size: 48px;
          color: white;
        }
      }

      .avatar-overlay {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: var(--ion-color-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;

        ion-icon {
          font-size: 16px;
          color: white;
        }
      }
    }

    ion-list {
      margin-top: 16px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;

      ion-icon[slot="start"] {
        margin-right: 12px;
        font-size: 20px;
      }
    }

    .readonly-input {
      opacity: 0.6;
    }

    .field-error {
      padding: 4px 16px 8px 48px;
      font-size: 12px;
    }

    .char-count {
      text-align: right;
      padding: 4px 16px;
      font-size: 12px;
    }

    .rules-section {
      padding: 16px;
      margin: 16px;
      background: var(--ion-color-light);
      border-radius: 8px;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          font-size: 12px;
          color: var(--ion-color-medium);
          margin-bottom: 4px;
          transition: color 0.2s;

          &.valid {
            color: var(--ion-color-success);
          }
        }
      }
    }
  `],
})
export class EditProfilePage implements OnInit {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);
  private authStateService = inject(AuthStateService);
  private userRepository = inject(USER_REPOSITORY);

  // Form fields
  username = '';
  bio = '';
  location = '';

  // State
  isLoading = signal(true);
  isSaving = signal(false);
  avatarUrl = signal<string | null>(null);
  email = signal('');
  usernameError = signal<string | null>(null);

  // Original values for change detection
  private originalUsername = '';
  private originalBio = '';
  private originalLocation = '';
  private originalAvatarUrl: string | null = null;
  private userId = '';

  hasChanges = computed(() => {
    return (
      this.username !== this.originalUsername ||
      this.bio !== this.originalBio ||
      this.location !== this.originalLocation ||
      this.avatarUrl() !== this.originalAvatarUrl
    );
  });

  constructor() {
    addIcons({
      personOutline,
      camera,
      checkmark,
      locationOutline,
      mailOutline,
      createOutline,
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    const user = this.authStateService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading.set(true);

    try {
      const userEntity = await this.userRepository.findById(user.id);
      if (userEntity) {
        this.userId = userEntity.id;
        this.username = userEntity.username;
        this.bio = userEntity.bio || '';
        this.location = userEntity.location || '';
        this.email.set(userEntity.email.value);
        this.avatarUrl.set(userEntity.avatarUrl || null);

        // Store original values
        this.originalUsername = this.username;
        this.originalBio = this.bio;
        this.originalLocation = this.location;
        this.originalAvatarUrl = this.avatarUrl();
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      const toast = await this.toastController.create({
        message: 'Failed to load profile',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }

    this.isLoading.set(false);
  }

  onInputChange(): void {
    this.validateUsername();
  }

  private validateUsername(): void {
    if (this.username.length < 3) {
      this.usernameError.set('Username must be at least 3 characters');
    } else if (this.username.length > 20) {
      this.usernameError.set('Username cannot exceed 20 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      this.usernameError.set('Only letters, numbers, and underscores allowed');
    } else {
      this.usernameError.set(null);
    }
  }

  isValidUsernameFormat(): boolean {
    return /^[a-zA-Z0-9_]*$/.test(this.username);
  }

  async changeAvatar(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Change Profile Photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          },
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => {
            this.chooseFromGallery();
          },
        },
        {
          text: 'Remove Photo',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.removePhoto();
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private async takePhoto(): Promise<void> {
    // TODO: Implement with Capacitor Camera
    const toast = await this.toastController.create({
      message: 'Camera feature coming soon!',
      duration: 2000,
    });
    await toast.present();
  }

  private async chooseFromGallery(): Promise<void> {
    // TODO: Implement with Capacitor Camera
    const toast = await this.toastController.create({
      message: 'Gallery feature coming soon!',
      duration: 2000,
    });
    await toast.present();
  }

  private async removePhoto(): Promise<void> {
    this.avatarUrl.set(null);
  }

  async saveProfile(): Promise<void> {
    if (!this.hasChanges() || this.usernameError()) return;

    this.isSaving.set(true);

    try {
      // Check if username is taken (if changed)
      if (this.username !== this.originalUsername) {
        const existingUser = await this.userRepository.findByUsername(this.username);
        if (existingUser && existingUser.id !== this.userId) {
          this.usernameError.set('Username is already taken');
          this.isSaving.set(false);
          return;
        }
      }

      const currentUser = this.authStateService.currentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create updated user entity
      const updatedUser = UserEntity.create({
        id: this.userId,
        email: Email.create(this.email()),
        username: this.username,
        bio: this.bio || undefined,
        location: this.location || undefined,
        avatarUrl: this.avatarUrl() || undefined,
        emailVerified: true,
      });

      await this.userRepository.update(updatedUser);

      // Update original values
      this.originalUsername = this.username;
      this.originalBio = this.bio;
      this.originalLocation = this.location;
      this.originalAvatarUrl = this.avatarUrl();

      const toast = await this.toastController.create({
        message: 'Profile updated successfully!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/tabs/profile']);
    } catch (error) {
      console.error('Failed to save profile:', error);
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      const alert = await this.alertController.create({
        header: 'Error',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    }

    this.isSaving.set(false);
  }
}
