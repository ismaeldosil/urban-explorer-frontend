import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonBackButton,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonNote,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  personOutline,
  lockClosedOutline,
  trashOutline,
  globeOutline,
  moonOutline,
  notificationsOutline,
  mailOutline,
  informationCircleOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  codeSlashOutline,
  logOutOutline,
  keyOutline,
} from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { SupabaseService } from '@infrastructure/services/supabase.service';
import { PreferencesService, DistanceUnit, ThemeMode } from '@infrastructure/services/preferences.service';
import { environment } from '@env';

@Component({
  selector: 'app-settings',
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
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Account Section -->
      <ion-list-header>
        <ion-label>Account</ion-label>
      </ion-list-header>
      <ion-list inset>
        <ion-item button (click)="changePassword()">
          <ion-icon name="lock-closed-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Change Password</ion-label>
        </ion-item>

        <ion-item button lines="none" (click)="deleteAccount()">
          <ion-icon name="trash-outline" slot="start" color="danger"></ion-icon>
          <ion-label color="danger">Delete Account</ion-label>
        </ion-item>
      </ion-list>

      <!-- Preferences Section -->
      <ion-list-header>
        <ion-label>Preferences</ion-label>
      </ion-list-header>
      <ion-list inset>
        <ion-item>
          <ion-icon name="globe-outline" slot="start" color="primary"></ion-icon>
          <ion-select
            label="Distance Unit"
            [value]="distanceUnit()"
            (ionChange)="onDistanceUnitChange($event)"
            interface="action-sheet"
          >
            <ion-select-option value="km">Kilometers (km)</ion-select-option>
            <ion-select-option value="miles">Miles (mi)</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item button (click)="showLanguageComingSoon()">
          <ion-icon name="globe-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            Language
            <ion-note slot="end">English</ion-note>
          </ion-label>
        </ion-item>

        <ion-item lines="none">
          <ion-icon name="moon-outline" slot="start" color="primary"></ion-icon>
          <ion-select
            label="Theme"
            [value]="theme()"
            (ionChange)="onThemeChange($event)"
            interface="action-sheet"
          >
            <ion-select-option value="light">Light</ion-select-option>
            <ion-select-option value="dark">Dark</ion-select-option>
            <ion-select-option value="auto">Auto (System)</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <!-- Notifications Section -->
      <ion-list-header>
        <ion-label>Notifications</ion-label>
      </ion-list-header>
      <ion-list inset>
        <ion-item>
          <ion-icon name="notifications-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Push Notifications</ion-label>
          <ion-toggle
            slot="end"
            [checked]="pushNotifications()"
            (ionChange)="onPushNotificationsChange($event)"
          ></ion-toggle>
        </ion-item>

        <ion-item lines="none">
          <ion-icon name="mail-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Email Notifications</ion-label>
          <ion-toggle
            slot="end"
            [checked]="emailNotifications()"
            (ionChange)="onEmailNotificationsChange($event)"
          ></ion-toggle>
        </ion-item>
      </ion-list>

      <!-- About Section -->
      <ion-list-header>
        <ion-label>About</ion-label>
      </ion-list-header>
      <ion-list inset>
        <ion-item>
          <ion-icon name="information-circle-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            App Version
            <ion-note slot="end">{{ appVersion }}</ion-note>
          </ion-label>
        </ion-item>

        <ion-item button (click)="openTermsOfService()">
          <ion-icon name="document-text-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Terms of Service</ion-label>
        </ion-item>

        <ion-item button (click)="openPrivacyPolicy()">
          <ion-icon name="shield-checkmark-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Privacy Policy</ion-label>
        </ion-item>

        <ion-item button lines="none" (click)="openLicenses()">
          <ion-icon name="code-slash-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Open Source Licenses</ion-label>
        </ion-item>
      </ion-list>

      <!-- Sign Out Button -->
      <div class="sign-out-container">
        <ion-button
          expand="block"
          color="danger"
          fill="outline"
          (click)="signOut()"
        >
          <ion-icon slot="start" name="log-out-outline"></ion-icon>
          Sign Out
        </ion-button>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Made with love for urban explorers</p>
        <p class="copyright">&copy; {{ currentYear }} Urban Explorer</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-list-header {
      padding-top: 24px;
      padding-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    ion-list {
      margin-bottom: 0;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;

      ion-icon[slot="start"] {
        margin-right: 16px;
        font-size: 22px;
      }
    }

    ion-select {
      width: 100%;
      justify-content: flex-end;
    }

    ion-note {
      color: var(--ion-color-medium);
      font-size: 14px;
    }

    .sign-out-container {
      padding: 32px 16px 16px;

      ion-button {
        --border-width: 2px;
        font-weight: 600;
        height: 48px;
      }
    }

    .footer {
      text-align: center;
      padding: 24px 16px 32px;
      color: var(--ion-color-medium);

      p {
        margin: 4px 0;
        font-size: 13px;
      }

      .copyright {
        font-size: 11px;
      }
    }
  `],
})
export class SettingsPage implements OnInit {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);
  private authStateService = inject(AuthStateService);
  private supabaseService = inject(SupabaseService);
  private preferencesService = inject(PreferencesService);

  readonly distanceUnit = this.preferencesService.distanceUnit;
  readonly theme = this.preferencesService.theme;
  readonly pushNotifications = this.preferencesService.pushNotifications;
  readonly emailNotifications = this.preferencesService.emailNotifications;

  readonly appVersion = environment.appVersion || '1.0.0';
  readonly currentYear = new Date().getFullYear();

  constructor() {
    addIcons({
      settingsOutline,
      personOutline,
      lockClosedOutline,
      trashOutline,
      globeOutline,
      moonOutline,
      notificationsOutline,
      mailOutline,
      informationCircleOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      codeSlashOutline,
      logOutOutline,
      keyOutline,
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authStateService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  async onDistanceUnitChange(event: any): Promise<void> {
    const unit = event.detail.value as DistanceUnit;
    try {
      await this.preferencesService.updateDistanceUnit(unit);
      const toast = await this.toastController.create({
        message: `Distance unit changed to ${unit === 'km' ? 'kilometers' : 'miles'}`,
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to update distance unit:', error);
    }
  }

  async onThemeChange(event: any): Promise<void> {
    const theme = event.detail.value as ThemeMode;
    try {
      await this.preferencesService.updateTheme(theme);
      const themeLabel = theme === 'auto' ? 'Auto (System)' : theme === 'dark' ? 'Dark' : 'Light';
      const toast = await this.toastController.create({
        message: `Theme changed to ${themeLabel}`,
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  }

  async onPushNotificationsChange(event: any): Promise<void> {
    const enabled = event.detail.checked;
    try {
      await this.preferencesService.updatePushNotifications(enabled);
      const toast = await this.toastController.create({
        message: `Push notifications ${enabled ? 'enabled' : 'disabled'}`,
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to update push notifications:', error);
    }
  }

  async onEmailNotificationsChange(event: any): Promise<void> {
    const enabled = event.detail.checked;
    try {
      await this.preferencesService.updateEmailNotifications(enabled);
      const toast = await this.toastController.create({
        message: `Email notifications ${enabled ? 'enabled' : 'disabled'}`,
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to update email notifications:', error);
    }
  }

  async changePassword(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Change Password',
      message: 'You will receive a password reset email.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Enter your email',
          value: this.authStateService.currentUser()?.email.value || '',
          attributes: {
            readonly: true,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Send Reset Email',
          handler: async (data) => {
            try {
              await this.supabaseService.resetPassword(data.email);
              const toast = await this.toastController.create({
                message: 'Password reset email sent! Check your inbox.',
                duration: 3000,
                color: 'success',
              });
              await toast.present();
            } catch (error) {
              console.error('Failed to send reset email:', error);
              const toast = await this.toastController.create({
                message: 'Failed to send reset email. Please try again.',
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteAccount(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Delete Account',
      subHeader: 'This action cannot be undone',
      buttons: [
        {
          text: 'Delete My Account',
          role: 'destructive',
          handler: async () => {
            await this.confirmDeleteAccount();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  private async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Are you absolutely sure?',
      message: 'This will permanently delete your account and all your data. This action cannot be undone.',
      inputs: [
        {
          name: 'confirmation',
          type: 'text',
          placeholder: 'Type DELETE to confirm',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete Account',
          role: 'destructive',
          handler: async (data) => {
            if (data.confirmation === 'DELETE') {
              await this.performAccountDeletion();
              return true;
            } else {
              const toast = await this.toastController.create({
                message: 'Please type DELETE to confirm',
                duration: 2000,
                color: 'warning',
              });
              await toast.present();
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async performAccountDeletion(): Promise<void> {
    try {
      // TODO: Implement account deletion logic
      // This should call a backend endpoint to delete user data
      const toast = await this.toastController.create({
        message: 'Account deletion feature coming soon',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to delete account:', error);
      const toast = await this.toastController.create({
        message: 'Failed to delete account. Please try again.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async showLanguageComingSoon(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Multi-language support coming soon!',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  async openTermsOfService(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Terms of Service',
      message: 'Terms of Service will be available soon. For now, please contact support for any questions.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async openPrivacyPolicy(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Privacy Policy',
      message: 'Privacy Policy will be available soon. Your privacy is important to us.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async openLicenses(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Open Source Licenses',
      message: `
        This app is built with:
        - Ionic Framework (MIT)
        - Angular (MIT)
        - Capacitor (MIT)
        - Leaflet (BSD-2-Clause)
        - Supabase (Apache 2.0)

        Full license information available in the repository.
      `,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async signOut(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sign Out',
      subHeader: 'Are you sure you want to sign out?',
      buttons: [
        {
          text: 'Sign Out',
          role: 'destructive',
          icon: 'log-out-outline',
          handler: async () => {
            try {
              await this.supabaseService.signOut();
              this.authStateService.clearUser();

              const toast = await this.toastController.create({
                message: 'Signed out successfully',
                duration: 2000,
                color: 'success',
              });
              await toast.present();

              this.router.navigate(['/auth/login']);
            } catch (error) {
              console.error('Failed to sign out:', error);
              const toast = await this.toastController.create({
                message: 'Failed to sign out. Please try again.',
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }
}
