# Deep Linking Usage Examples

This document provides code examples for implementing deep links in the Urban Explorer app.

## Generating Deep Links in Your Code

### Location Sharing

```typescript
// location-detail.page.ts
import { Share } from '@capacitor/share';

export class LocationDetailPage {
  locationId: string = '123';

  async shareLocation() {
    const deepLink = `urbanexplorer://location/${this.locationId}`;
    const universalLink = `https://urbanexplorer.app/location/${this.locationId}`;

    await Share.share({
      title: 'Check out this location!',
      text: 'I found this amazing place on Urban Explorer',
      url: universalLink, // Universal links work on web and mobile
      dialogTitle: 'Share Location',
    });
  }
}
```

### Profile Sharing

```typescript
// profile.page.ts
import { Share } from '@capacitor/share';

export class ProfilePage {
  username: string = 'johndoe';

  async shareProfile() {
    const deepLink = `urbanexplorer://profile/${this.username}`;
    const universalLink = `https://urbanexplorer.app/profile/${this.username}`;

    await Share.share({
      title: 'Check out this user profile!',
      text: `Follow ${this.username} on Urban Explorer`,
      url: universalLink,
      dialogTitle: 'Share Profile',
    });
  }

  // Generate QR code for profile
  generateProfileQR(): string {
    const universalLink = `https://urbanexplorer.app/profile/${this.username}`;
    // Use QR code library to generate QR code
    return universalLink;
  }
}
```

### Review Sharing

```typescript
// review-card.component.ts
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';

export class ReviewCardComponent {
  reviewId: string = '456';

  async shareReview() {
    const universalLink = `https://urbanexplorer.app/review/${this.reviewId}`;

    await Share.share({
      title: 'Check out this review!',
      text: 'Read this interesting review on Urban Explorer',
      url: universalLink,
      dialogTitle: 'Share Review',
    });
  }

  async copyReviewLink() {
    const universalLink = `https://urbanexplorer.app/review/${this.reviewId}`;

    await Clipboard.write({
      string: universalLink,
    });

    // Show toast notification
    console.log('Link copied to clipboard!');
  }
}
```

## Creating Share Buttons in Templates

### Location Detail Template

```html
<!-- location-detail.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Location Details</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="shareLocation()">
        <ion-icon name="share-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card>
    <ion-card-header>
      <ion-card-title>{{ location.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      {{ location.description }}
    </ion-card-content>
    <ion-card-content>
      <ion-button expand="block" (click)="shareLocation()">
        <ion-icon name="share-social-outline" slot="start"></ion-icon>
        Share this location
      </ion-button>
    </ion-card-content>
  </ion-card>
</ion-content>
```

### Profile Template

```html
<!-- profile.page.html -->
<ion-content>
  <ion-card>
    <ion-card-header>
      <ion-avatar>
        <img [src]="user.avatar" alt="Profile picture" />
      </ion-avatar>
      <ion-card-title>{{ user.name }}</ion-card-title>
      <ion-card-subtitle>@{{ username }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-button expand="block" (click)="shareProfile()">
        <ion-icon name="share-outline" slot="start"></ion-icon>
        Share Profile
      </ion-button>
    </ion-card-content>
  </ion-card>
</ion-content>
```

## Handling Deep Links in Components

### Location Detail Page

```typescript
// location-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from '../../domain/services/location.service';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.page.html',
})
export class LocationDetailPage implements OnInit {
  locationId: string;
  location: any;

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Get ID from route parameter (works for both direct navigation and deep links)
    this.locationId = this.route.snapshot.paramMap.get('id')!;

    // Load location data
    this.loadLocation();
  }

  async loadLocation() {
    try {
      this.location = await this.locationService.getLocationById(this.locationId);
    } catch (error) {
      console.error('Error loading location:', error);
      // Handle error (e.g., show error message, navigate back)
    }
  }
}
```

### Profile Page with Username

```typescript
// profile.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../domain/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  username: string;
  user: any;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get username from route parameter
    this.username = this.route.snapshot.paramMap.get('username')!;

    // Check if viewing own profile
    this.checkIfOwnProfile();

    // Load user data
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.user = await this.userService.getUserByUsername(this.username);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Handle error
    }
  }

  async checkIfOwnProfile() {
    const currentUser = await this.userService.getCurrentUser();
    this.isOwnProfile = currentUser?.username === this.username;
  }
}
```

## Push Notification with Deep Links

### Sending Push Notifications with Deep Links

```typescript
// notification.service.ts
export class NotificationService {
  async sendLocationNotification(userId: string, locationId: string) {
    const notification = {
      title: 'New Location Nearby!',
      body: 'Check out this amazing place near you',
      data: {
        type: 'location',
        id: locationId,
        // Both custom scheme and universal link
        deepLink: `urbanexplorer://location/${locationId}`,
        universalLink: `https://urbanexplorer.app/location/${locationId}`,
      },
    };

    // Send via your push notification service (FCM, APNs, etc.)
    await this.pushNotificationService.send(userId, notification);
  }

  async sendReviewNotification(userId: string, reviewId: string) {
    const notification = {
      title: 'New Review on Your Location',
      body: 'Someone just reviewed your location!',
      data: {
        type: 'review',
        id: reviewId,
        deepLink: `urbanexplorer://review/${reviewId}`,
        universalLink: `https://urbanexplorer.app/review/${reviewId}`,
      },
    };

    await this.pushNotificationService.send(userId, notification);
  }
}
```

### Handling Push Notification Taps

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { DeepLinkService } from './infrastructure/services/deep-link.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private deepLinkService: DeepLinkService) {}

  ngOnInit() {
    this.setupPushNotifications();
  }

  async setupPushNotifications() {
    // Listen for notification taps
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      const data = notification.notification.data;

      // Handle deep link from notification
      if (data.deepLink) {
        this.deepLinkService.handleUrl(data.deepLink);
      } else if (data.universalLink) {
        this.deepLinkService.handleUrl(data.universalLink);
      }
    });
  }
}
```

## Email Marketing with Deep Links

### Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Urban Explorer Newsletter</title>
</head>
<body>
    <h1>Check out these trending locations!</h1>

    <div class="location-card">
        <h2>Central Park</h2>
        <p>Explore the heart of the city</p>
        <!-- Use universal link for email -->
        <a href="https://urbanexplorer.app/location/central-park-123">
            View Location
        </a>
    </div>

    <div class="location-card">
        <h2>Times Square</h2>
        <p>The city that never sleeps</p>
        <a href="https://urbanexplorer.app/location/times-square-456">
            View Location
        </a>
    </div>
</body>
</html>
```

## Social Media Integration

### Generate Social Share Links

```typescript
// social-share.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SocialShareService {
  shareOnTwitter(locationId: string, locationName: string) {
    const url = `https://urbanexplorer.app/location/${locationId}`;
    const text = `Check out ${locationName} on Urban Explorer!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, '_blank');
  }

  shareOnFacebook(locationId: string) {
    const url = `https://urbanexplorer.app/location/${locationId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    window.open(facebookUrl, '_blank');
  }

  shareOnWhatsApp(locationId: string, locationName: string) {
    const url = `https://urbanexplorer.app/location/${locationId}`;
    const text = `Check out ${locationName} on Urban Explorer! ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, '_blank');
  }
}
```

## QR Code Generation

### Generate QR Code for Locations

```typescript
// qr-code.service.ts
import { Injectable } from '@angular/core';
import QRCode from 'qrcode'; // npm install qrcode @types/qrcode

@Injectable({
  providedIn: 'root',
})
export class QRCodeService {
  async generateLocationQR(locationId: string): Promise<string> {
    const url = `https://urbanexplorer.app/location/${locationId}`;

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async downloadLocationQR(locationId: string, locationName: string) {
    const qrDataUrl = await this.generateLocationQR(locationId);

    // Create download link
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${locationName}-qr.png`;
    link.click();
  }
}
```

### Display QR Code in Template

```html
<!-- qr-code.component.html -->
<ion-content>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Share via QR Code</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div class="qr-code-container">
        <img [src]="qrCodeDataUrl" alt="QR Code" />
      </div>
      <ion-button expand="block" (click)="downloadQRCode()">
        <ion-icon name="download-outline" slot="start"></ion-icon>
        Download QR Code
      </ion-button>
    </ion-card-content>
  </ion-card>
</ion-content>
```

```typescript
// qr-code.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { QRCodeService } from '../../services/qr-code.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
})
export class QRCodeComponent implements OnInit {
  @Input() locationId: string;
  @Input() locationName: string;

  qrCodeDataUrl: string;

  constructor(private qrCodeService: QRCodeService) {}

  async ngOnInit() {
    this.qrCodeDataUrl = await this.qrCodeService.generateLocationQR(this.locationId);
  }

  async downloadQRCode() {
    await this.qrCodeService.downloadLocationQR(this.locationId, this.locationName);
  }
}
```

## Analytics Tracking

### Track Deep Link Usage

```typescript
// analytics.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  trackDeepLinkOpen(url: string, source: string = 'unknown') {
    // Parse URL to extract type and ID
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(s => s);
    const type = pathSegments[0];
    const id = pathSegments[1];

    // Track event
    this.trackEvent('deep_link_opened', {
      url: url,
      type: type,
      id: id,
      source: source,
      timestamp: new Date().toISOString(),
    });
  }

  private trackEvent(eventName: string, params: any) {
    // Send to your analytics service (Firebase, Mixpanel, etc.)
    console.log('Analytics Event:', eventName, params);
  }
}
```

### Integrate with DeepLinkService

```typescript
// deep-link.service.ts (updated)
import { AnalyticsService } from './analytics.service';

export class DeepLinkService {
  constructor(
    private router: Router,
    private platform: Platform,
    private analytics: AnalyticsService // Add analytics
  ) {}

  private handleDeepLink(url: string): void {
    try {
      // Track deep link open
      this.analytics.trackDeepLinkOpen(url, 'app_open');

      // ... rest of the deep link handling code
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }
}
```

## Best Practices

1. **Always use universal links for sharing** - They work on web and mobile
2. **Validate parameters** - Check if IDs exist before navigating
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Track deep link usage** - Monitor which links are most popular
5. **Test on physical devices** - Simulators may behave differently
6. **Use HTTPS** - Required for universal/app links
7. **Keep URLs short and readable** - Better for user experience
8. **Include fallback handling** - Handle cases where content is not found

## Need Help?

See the full setup documentation in [DEEP_LINKING_SETUP.md](./DEEP_LINKING_SETUP.md)
