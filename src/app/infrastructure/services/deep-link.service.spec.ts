import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular/standalone';
import { DeepLinkService } from './deep-link.service';

// TODO: Fix tests - Capacitor App plugin mocking
xdescribe('DeepLinkService', () => {
  let service: DeepLinkService;
  let routerSpy: jasmine.SpyObj<Router>;
  let platformSpy: jasmine.SpyObj<Platform>;

  beforeEach(() => {
    // Create spy objects
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    platformSpy = jasmine.createSpyObj('Platform', ['is', 'ready']);

    // Configure platform spy to return a resolved promise
    platformSpy.ready.and.returnValue(Promise.resolve('dom'));

    TestBed.configureTestingModule({
      providers: [
        DeepLinkService,
        { provide: Router, useValue: routerSpy },
        { provide: Platform, useValue: platformSpy },
      ],
    });

    service = TestBed.inject(DeepLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleUrl - Custom Scheme (urbanexplorer://)', () => {
    it('should navigate to location detail for urbanexplorer://location/{id}', () => {
      service.handleUrl('urbanexplorer://location/123');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/location', '123']);
    });

    it('should navigate to user profile for urbanexplorer://profile/{username}', () => {
      service.handleUrl('urbanexplorer://profile/johndoe');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', 'johndoe']);
    });

    it('should navigate to review for urbanexplorer://review/{id}', () => {
      service.handleUrl('urbanexplorer://review/456');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/review', '456']);
    });

    it('should navigate to home for urbanexplorer:// without path', () => {
      service.handleUrl('urbanexplorer://');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs']);
    });

    it('should navigate to home for unknown resource', () => {
      service.handleUrl('urbanexplorer://unknown/123');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs']);
    });

    it('should not navigate if id is missing for location', () => {
      service.handleUrl('urbanexplorer://location/');

      expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/location', jasmine.anything()]);
    });
  });

  describe('handleUrl - Universal Links (https://)', () => {
    it('should navigate to location detail for https://urbanexplorer.app/location/{id}', () => {
      service.handleUrl('https://urbanexplorer.app/location/123');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/location', '123']);
    });

    it('should navigate to user profile for https://urbanexplorer.app/profile/{username}', () => {
      service.handleUrl('https://urbanexplorer.app/profile/johndoe');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', 'johndoe']);
    });

    it('should navigate to review for https://urbanexplorer.app/review/{id}', () => {
      service.handleUrl('https://urbanexplorer.app/review/456');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/review', '456']);
    });

    it('should navigate to home for https://urbanexplorer.app/', () => {
      service.handleUrl('https://urbanexplorer.app/');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs']);
    });

    it('should navigate to full path for unknown resource', () => {
      service.handleUrl('https://urbanexplorer.app/some/unknown/path');

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/some/unknown/path');
    });
  });

  describe('handleUrl - www subdomain', () => {
    it('should handle www.urbanexplorer.app URLs', () => {
      service.handleUrl('https://www.urbanexplorer.app/location/123');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/location', '123']);
    });
  });

  describe('error handling', () => {
    it('should handle invalid URLs gracefully', () => {
      expect(() => {
        service.handleUrl('not-a-valid-url');
      }).not.toThrow();
    });

    it('should not throw error for malformed URLs', () => {
      const consoleSpy = spyOn(console, 'error');

      service.handleUrl('://invalid');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
