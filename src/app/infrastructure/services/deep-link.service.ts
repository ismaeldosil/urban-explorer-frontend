import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Platform } from '@ionic/angular/standalone';

/**
 * Deep Link Service
 * Handles incoming deep links and universal links for the Urban Explorer app.
 * Supports custom URL schemes (urbanexplorer://) and HTTPS universal links.
 */
@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  constructor(
    private router: Router,
    private platform: Platform
  ) {}

  /**
   * Initialize deep link listener
   * Call this method in app.component.ts after platform is ready
   */
  initialize(): void {
    // Only initialize on mobile platforms
    if (!this.platform.is('capacitor')) {
      return;
    }

    // Listen for app URL open events
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.handleDeepLink(event.url);
    });
  }

  /**
   * Handle incoming deep link URL
   * @param url - The deep link URL to process
   */
  private handleDeepLink(url: string): void {
    try {
      // Parse the URL
      const parsedUrl = new URL(url);

      // Handle different URL schemes
      if (parsedUrl.protocol === 'urbanexplorer:') {
        this.handleCustomScheme(parsedUrl);
      } else if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        this.handleUniversalLink(parsedUrl);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Handle custom URL scheme (urbanexplorer://)
   * @param url - Parsed URL object
   */
  private handleCustomScheme(url: URL): void {
    const path = url.pathname;
    const segments = path.split('/').filter(segment => segment.length > 0);

    if (segments.length === 0) {
      // No specific path, navigate to home
      this.router.navigate(['/tabs']);
      return;
    }

    const resource = segments[0];
    const id = segments[1];

    switch (resource) {
      case 'location':
        if (id) {
          // Navigate to location detail: urbanexplorer://location/{id}
          this.router.navigate(['/location', id]);
        }
        break;

      case 'profile':
        if (id) {
          // Navigate to user profile: urbanexplorer://profile/{username}
          this.router.navigate(['/profile', id]);
        }
        break;

      case 'review':
        if (id) {
          // Navigate to specific review: urbanexplorer://review/{id}
          this.router.navigate(['/review', id]);
        }
        break;

      default:
        // Unknown resource, navigate to home
        this.router.navigate(['/tabs']);
        break;
    }
  }

  /**
   * Handle universal link (https://urbanexplorer.app/...)
   * @param url - Parsed URL object
   */
  private handleUniversalLink(url: URL): void {
    // Extract path from universal link
    const path = url.pathname;
    const segments = path.split('/').filter(segment => segment.length > 0);

    if (segments.length === 0) {
      // Root URL, navigate to home
      this.router.navigate(['/tabs']);
      return;
    }

    const resource = segments[0];
    const id = segments[1];

    switch (resource) {
      case 'location':
        if (id) {
          // Navigate to location detail: https://urbanexplorer.app/location/{id}
          this.router.navigate(['/location', id]);
        }
        break;

      case 'profile':
        if (id) {
          // Navigate to user profile: https://urbanexplorer.app/profile/{username}
          this.router.navigate(['/profile', id]);
        }
        break;

      case 'review':
        if (id) {
          // Navigate to specific review: https://urbanexplorer.app/review/{id}
          this.router.navigate(['/review', id]);
        }
        break;

      default:
        // Try to navigate to the full path
        this.router.navigateByUrl(path);
        break;
    }
  }

  /**
   * Manually handle a deep link (useful for testing)
   * @param url - The deep link URL to handle
   */
  public handleUrl(url: string): void {
    this.handleDeepLink(url);
  }

  /**
   * Clean up listeners when service is destroyed
   */
  destroy(): void {
    App.removeAllListeners();
  }
}
