import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PasswordStrengthIndicatorComponent } from './password-strength-indicator.component';
import { IonicModule } from '@ionic/angular';
import { SimpleChange } from '@angular/core';

describe('PasswordStrengthIndicatorComponent', () => {
  let component: PasswordStrengthIndicatorComponent;
  let fixture: ComponentFixture<PasswordStrengthIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthIndicatorComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default showRequirements to true', () => {
      expect(component.showRequirements).toBe(true);
    });

    it('should default minLength to 8', () => {
      expect(component.minLength).toBe(8);
    });

    it('should have 4 bars', () => {
      expect(component.bars).toEqual([1, 2, 3, 4]);
    });
  });

  describe('ngOnChanges', () => {
    it('should update analysis when password changes', () => {
      component.password = 'weakpass';
      component.ngOnChanges({
        password: new SimpleChange(null, 'weakpass', true),
      });
      fixture.detectChanges();

      const analysis = component.analysis();
      expect(analysis).toBeDefined();
    });
  });

  describe('analysis', () => {
    it('should return weak for empty password', () => {
      component.password = '';
      component.ngOnChanges({
        password: new SimpleChange(null, '', true),
      });
      fixture.detectChanges();

      expect(component.analysis().strength).toBe('weak');
      expect(component.analysis().score).toBe(0);
    });

    it('should return weak for short password', () => {
      component.password = 'abc';
      component.ngOnChanges({
        password: new SimpleChange(null, 'abc', true),
      });
      fixture.detectChanges();

      expect(component.analysis().strength).toBe('weak');
    });

    it('should return fair for password meeting some requirements', () => {
      component.password = 'password';
      component.ngOnChanges({
        password: new SimpleChange(null, 'password', true),
      });
      fixture.detectChanges();

      const analysis = component.analysis();
      expect(analysis.score).toBeGreaterThanOrEqual(1);
    });

    it('should return good for password meeting most requirements', () => {
      component.password = 'Password1';
      component.ngOnChanges({
        password: new SimpleChange(null, 'Password1', true),
      });
      fixture.detectChanges();

      const analysis = component.analysis();
      expect(analysis.score).toBeGreaterThanOrEqual(3);
    });

    it('should return strong for password meeting all requirements', () => {
      component.password = 'Password1!@#';
      component.ngOnChanges({
        password: new SimpleChange(null, 'Password1!@#', true),
      });
      fixture.detectChanges();

      const analysis = component.analysis();
      expect(analysis.strength).toBe('strong');
    });
  });

  describe('requirements', () => {
    it('should check for minimum length', () => {
      component.password = 'short';
      component.ngOnChanges({
        password: new SimpleChange(null, 'short', true),
      });

      const lengthReq = component.analysis().requirements.find(r => r.id === 'length');
      expect(lengthReq?.met).toBe(false);
    });

    it('should check for lowercase', () => {
      component.password = 'UPPERCASE';
      component.ngOnChanges({
        password: new SimpleChange(null, 'UPPERCASE', true),
      });

      const lowercaseReq = component.analysis().requirements.find(r => r.id === 'lowercase');
      expect(lowercaseReq?.met).toBe(false);
    });

    it('should check for uppercase', () => {
      component.password = 'lowercase';
      component.ngOnChanges({
        password: new SimpleChange(null, 'lowercase', true),
      });

      const uppercaseReq = component.analysis().requirements.find(r => r.id === 'uppercase');
      expect(uppercaseReq?.met).toBe(false);
    });

    it('should check for number', () => {
      component.password = 'NoNumbers';
      component.ngOnChanges({
        password: new SimpleChange(null, 'NoNumbers', true),
      });

      const numberReq = component.analysis().requirements.find(r => r.id === 'number');
      expect(numberReq?.met).toBe(false);
    });

    it('should check for special character', () => {
      component.password = 'NoSpecial123';
      component.ngOnChanges({
        password: new SimpleChange(null, 'NoSpecial123', true),
      });

      const specialReq = component.analysis().requirements.find(r => r.id === 'special');
      expect(specialReq?.met).toBe(false);
    });
  });

  describe('strengthLabel', () => {
    it('should return Muy Débil for weak', () => {
      component.password = '';
      component.ngOnChanges({
        password: new SimpleChange(null, '', true),
      });

      expect(component.strengthLabel()).toBe('Muy Débil');
    });

    it('should return Excelente for strong password', () => {
      component.password = 'Password1!@#Extra';
      component.ngOnChanges({
        password: new SimpleChange(null, 'Password1!@#Extra', true),
      });

      expect(component.strengthLabel()).toBe('Excelente');
    });
  });

  describe('validatePassword static method', () => {
    it('should return valid for strong password', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('Password1!');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return error for short password', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('Pa1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return error for missing lowercase', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('PASSWORD1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe incluir al menos una letra minúscula');
    });

    it('should return error for missing uppercase', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('password1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe incluir al menos una letra mayúscula');
    });

    it('should return error for missing number', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('Password!!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe incluir al menos un número');
    });

    it('should return error for missing special character', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('Password12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe incluir al menos un carácter especial');
    });

    it('should accept custom minLength', () => {
      const result = PasswordStrengthIndicatorComponent.validatePassword('Pass1!', 6);
      expect(result.isValid).toBe(true);
    });
  });
});
