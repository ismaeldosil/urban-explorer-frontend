import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings.page';
import { Router } from '@angular/router';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { SupabaseService } from '@infrastructure/services/supabase.service';
import { PreferencesService } from '@infrastructure/services/preferences.service';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthStateService: jasmine.SpyObj<AuthStateService>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthStateService = jasmine.createSpyObj('AuthStateService', ['isAuthenticated', 'currentUser', 'clearUser']);
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['signOut', 'resetPassword']);
    mockPreferencesService = jasmine.createSpyObj('PreferencesService', [
      'updateDistanceUnit',
      'updateTheme',
      'updatePushNotifications',
      'updateEmailNotifications',
      'getPreferences'
    ], {
      distanceUnit: jasmine.createSpy().and.returnValue('km'),
      theme: jasmine.createSpy().and.returnValue('auto'),
      pushNotifications: jasmine.createSpy().and.returnValue(true),
      emailNotifications: jasmine.createSpy().and.returnValue(true),
    });

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthStateService, useValue: mockAuthStateService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: PreferencesService, useValue: mockPreferencesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    mockAuthStateService.isAuthenticated.and.returnValue(false);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should not redirect if authenticated', () => {
    mockAuthStateService.isAuthenticated.and.returnValue(true);
    component.ngOnInit();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should have correct app version', () => {
    expect(component.appVersion).toBe('1.0.0');
  });

  it('should have correct current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });
});
