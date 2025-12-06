# Settings Page

Comprehensive settings page for the Urban Explorer app (Sprint 4).

## Features

### 1. Account Section
- **Change Password**: Sends a password reset email via Supabase Auth
- **Delete Account**: Confirmation flow requiring user to type "DELETE" (placeholder implementation)

### 2. Preferences Section
- **Distance Unit**: Toggle between kilometers (km) and miles (mi)
- **Language**: Placeholder for multi-language support (coming soon)
- **Theme**: Choose between Light, Dark, or Auto (System) mode using Ionic's dark mode

### 3. Notifications Section
- **Push Notifications**: Toggle for push notification preferences
- **Email Notifications**: Toggle for email notification preferences

### 4. About Section
- **App Version**: Displays current app version from environment config
- **Terms of Service**: Placeholder link
- **Privacy Policy**: Placeholder link
- **Open Source Licenses**: Lists key open source libraries used

### 5. Sign Out
- Red button at bottom with confirmation dialog
- Clears user session and redirects to login

## Technical Implementation

### Services Used

#### PreferencesService
Located at: `/src/app/infrastructure/services/preferences.service.ts`

Manages user preferences using Capacitor Preferences for persistent storage:
- Distance unit (km/miles)
- Language (en/es)
- Theme (light/dark/auto)
- Push notifications toggle
- Email notifications toggle

All preferences are stored in local storage and survive app restarts.

#### Theme Management
The theme preference applies Ionic's dark mode by toggling the `dark` class on the body element:
- `light`: Always light theme
- `dark`: Always dark theme
- `auto`: Follows system preference using `prefers-color-scheme` media query

### Route Configuration
Already configured in `app.routes.ts`:
```typescript
{
  path: 'settings',
  loadComponent: () => import('./presentation/pages/profile/settings/settings.page').then(m => m.SettingsPage)
}
```

## UI Components Used
- `IonList` with `inset` attribute for modern iOS-style grouped lists
- `IonToggle` for boolean settings
- `IonSelect` with `action-sheet` interface for option pickers
- `AlertController` for confirmations
- `ToastController` for feedback messages
- `ActionSheetController` for destructive actions

## Accessibility
- All interactive elements have proper labels
- Icons use outline variants for consistency
- Color-coded dangerous actions (red for delete/sign out)
- Clear visual hierarchy with section headers

## Future Enhancements
- [ ] Implement actual account deletion backend endpoint
- [ ] Add multi-language support (i18n)
- [ ] Add Terms of Service and Privacy Policy pages
- [ ] Implement actual push notification registration
- [ ] Add more preferences (notification sounds, haptic feedback, etc.)
- [ ] Export user data feature (GDPR compliance)

## Testing
- Unit tests in `settings.page.spec.ts`
- Preferences service tests in `preferences.service.spec.ts`

## Usage
Navigate to settings from the Profile tab or directly via `/profile/settings`.
