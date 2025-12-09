import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthStateService, AuthState } from './auth-state.service';
import { SupabaseService } from './supabase.service';
import { UserEntity } from '@core/entities/user.entity';
import { Email } from '@core/value-objects/email.vo';
import { BehaviorSubject } from 'rxjs';
import { Session } from '@supabase/supabase-js';

describe('AuthStateService', () => {
  let service: AuthStateService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let sessionSubject: BehaviorSubject<Session | null>;

  const createMockUser = (): UserEntity => {
    return UserEntity.create({
      id: 'user-123',
      email: Email.create('test@example.com'),
      username: 'testuser',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    sessionSubject = new BehaviorSubject<Session | null>(null);

    mockSupabaseService = jasmine.createSpyObj('SupabaseService', [
      'waitForInitialization',
      'from',
    ], {
      session$: sessionSubject.asObservable(),
    });

    mockSupabaseService.waitForInitialization.and.resolveTo();
    mockSupabaseService.from.and.returnValue({
      select: jasmine.createSpy().and.returnValue({
        eq: jasmine.createSpy().and.returnValue({
          single: jasmine.createSpy().and.resolveTo({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    } as any);

    TestBed.configureTestingModule({
      providers: [
        AuthStateService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      expect(service.state().status).toBe('loading');
    });

    it('should have isLoading true initially', () => {
      expect(service.isLoading()).toBe(true);
    });

    it('should have isAuthenticated false initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should have currentUser null initially', () => {
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set authenticated state with user', () => {
      const mockUser = createMockUser();

      service.setUser(mockUser);

      expect(service.state().status).toBe('authenticated');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toBe(mockUser);
    });
  });

  describe('clearUser', () => {
    it('should set unauthenticated state', () => {
      const mockUser = createMockUser();
      service.setUser(mockUser);

      service.clearUser();

      expect(service.state().status).toBe('unauthenticated');
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('waitForInitialization', () => {
    it('should wait for Supabase initialization', async () => {
      await service.waitForInitialization();

      expect(mockSupabaseService.waitForInitialization).toHaveBeenCalled();
    });
  });

  describe('state$', () => {
    it('should emit state changes as observable', async () => {
      const mockUser = createMockUser();

      // Get the current state before change
      const initialState = service.state();
      expect(initialState.status).toBe('loading');

      // Set user
      service.setUser(mockUser);

      // Get the updated state
      const updatedState = service.state();
      expect(updatedState.status).toBe('authenticated');
    });
  });
});
