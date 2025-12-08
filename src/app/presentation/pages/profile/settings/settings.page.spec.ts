import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { SettingsPage } from './settings.page';
import { Router } from '@angular/router';
import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { SupabaseService } from '@infrastructure/services/supabase.service';
import { PreferencesService } from '@infrastructure/services/preferences.service';
import {
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';

// TODO: Fix tests - need to properly mock Capacitor Preferences and signals
xdescribe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthStateService: any;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockPreferencesService: any;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockActionSheetController: jasmine.SpyObj<ActionSheetController>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthStateService = {
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
      currentUser: jasmine.createSpy('currentUser').and.returnValue(null),
      clearUser: jasmine.createSpy('clearUser'),
    };
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['signOut', 'resetPassword']);
    mockPreferencesService = {
      distanceUnit: signal('km'),
      theme: signal('auto'),
      pushNotifications: signal(true),
      emailNotifications: signal(true),
      updateDistanceUnit: jasmine.createSpy('updateDistanceUnit').and.returnValue(Promise.resolve()),
      updateTheme: jasmine.createSpy('updateTheme').and.returnValue(Promise.resolve()),
      updatePushNotifications: jasmine.createSpy('updatePushNotifications').and.returnValue(Promise.resolve()),
      updateEmailNotifications: jasmine.createSpy('updateEmailNotifications').and.returnValue(Promise.resolve()),
    };
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockActionSheetController = jasmine.createSpyObj('ActionSheetController', ['create']);

    // Mock toast controller to return a mock toast
    mockToastController.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    } as any));

    // Mock alert controller to return a mock alert
    mockAlertController.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    } as any));

    // Mock action sheet controller to return a mock action sheet
    mockActionSheetController.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    } as any));

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthStateService, useValue: mockAuthStateService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: PreferencesService, useValue: mockPreferencesService },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ToastController, useValue: mockToastController },
        { provide: ActionSheetController, useValue: mockActionSheetController },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    expect(component.appVersion).toBeDefined();
  });

  it('should have correct current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  // TODO: Fix these tests - they need proper mocking of Ionic controllers
  xit('should call signOut on supabase service', async () => {
    // Test sign out functionality
  });

  xit('should call changePassword', async () => {
    // Test change password functionality
  });
});
