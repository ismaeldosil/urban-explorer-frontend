import { TestBed } from '@angular/core/testing';
import { PreferencesService, DistanceUnit, ThemeMode } from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default preferences on init', () => {
    expect(service.distanceUnit()).toBe('km');
    expect(service.theme()).toBe('auto');
    expect(service.pushNotifications()).toBe(true);
    expect(service.emailNotifications()).toBe(true);
  });

  it('should update distance unit', async () => {
    await service.updateDistanceUnit('miles');
    expect(service.distanceUnit()).toBe('miles');
  });

  it('should update theme', async () => {
    await service.updateTheme('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should update push notifications', async () => {
    await service.updatePushNotifications(false);
    expect(service.pushNotifications()).toBe(false);
  });

  it('should update email notifications', async () => {
    await service.updateEmailNotifications(false);
    expect(service.emailNotifications()).toBe(false);
  });

  it('should return all preferences', () => {
    const prefs = service.getPreferences();
    expect(prefs).toBeDefined();
    expect(prefs.distanceUnit).toBe('km');
    expect(prefs.theme).toBe('auto');
    expect(prefs.pushNotifications).toBe(true);
    expect(prefs.emailNotifications).toBe(true);
  });
});
