import { Password } from './password.vo';
import { DomainError } from '../errors/domain-error';

describe('Password', () => {
  describe('create', () => {
    it('should create valid password', () => {
      const password = Password.create('ValidPass123');

      expect(password.value).toBe('ValidPass123');
    });

    it('should throw error for password shorter than 8 characters', () => {
      expect(() => Password.create('Short1A')).toThrowError(DomainError);
    });

    it('should throw error for password without uppercase', () => {
      expect(() => Password.create('lowercase123')).toThrowError(DomainError);
    });

    it('should throw error for password without lowercase', () => {
      expect(() => Password.create('UPPERCASE123')).toThrowError(DomainError);
    });

    it('should throw error for password without number', () => {
      expect(() => Password.create('NoNumbersHere')).toThrowError(DomainError);
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrowError(DomainError);
    });
  });

  describe('validate', () => {
    it('should return valid for strong password', () => {
      const result = Password.validate('ValidPass123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return error for short password', () => {
      const result = Password.validate('Short1A');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should return error for missing uppercase', () => {
      const result = Password.validate('lowercase123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return error for missing lowercase', () => {
      const result = Password.validate('UPPERCASE123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return error for missing number', () => {
      const result = Password.validate('NoNumbersHere');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak password', () => {
      const result = Password.validate('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getStrength', () => {
    it('should return score 0 for very weak password', () => {
      const strength = Password.getStrength('');

      expect(strength.score).toBe(0);
      expect(strength.label).toBe('Very Weak');
      expect(strength.color).toBe('danger');
    });

    it('should return score 1 for password with 8+ characters only', () => {
      const strength = Password.getStrength('aaaaaaaa');

      expect(strength.score).toBe(1);
      expect(strength.label).toBe('Weak');
    });

    it('should return score 2 for password with mixed case', () => {
      const strength = Password.getStrength('AaAaAaAa');

      expect(strength.score).toBe(2);
      expect(strength.label).toBe('Fair');
    });

    it('should return score 3 for password with mixed case and numbers', () => {
      const strength = Password.getStrength('AaAaAa12');

      expect(strength.score).toBe(3);
      expect(strength.label).toBe('Strong');
    });

    it('should return score 4 for password with all requirements plus special chars', () => {
      const strength = Password.getStrength('AaAaAa12!');

      expect(strength.score).toBe(4);
      expect(strength.label).toBe('Very Strong');
    });
  });
});
