import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { DeepLinkService } from './infrastructure/services/deep-link.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private platform: Platform,
    private deepLinkService: DeepLinkService
  ) {}

  ngOnInit(): void {
    this.platform.ready().then(() => {
      // Initialize deep link handling
      this.deepLinkService.initialize();
    });
  }

  ngOnDestroy(): void {
    // Clean up deep link listeners
    this.deepLinkService.destroy();
  }
}
