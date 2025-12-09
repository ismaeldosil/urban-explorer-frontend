import { Email } from './email.vo';
import { DomainError } from '../errors/domain-error';

describe('Email', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = Email.create('test@example.com');

      expect(email.value).toBe('test@example.com');
    });

    it('should lowercase email', () => {
      const email = Email.create('TEST@EXAMPLE.COM');

      expect(email.value).toBe('test@example.com');
    });

    it('should throw error for email with leading/trailing whitespace', () => {
      expect(() => Email.create('  test@example.com  ')).toThrowError(DomainError);
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrowError(DomainError);
    });

    it('should throw error for email without @', () => {
      expect(() => Email.create('testexample.com')).toThrowError(DomainError);
    });

    it('should throw error for email without domain', () => {
      expect(() => Email.create('test@')).toThrowError(DomainError);
    });

    it('should throw error for email without local part', () => {
      expect(() => Email.create('@example.com')).toThrowError(DomainError);
    });

    it('should throw error for email with spaces', () => {
      expect(() => Email.create('test @example.com')).toThrowError(DomainError);
    });
  });

  describe('isValid', () => {
    it('should return true for valid emails', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
      expect(Email.isValid('user.name@example.com')).toBe(true);
      expect(Email.isValid('user+tag@example.com')).toBe(true);
      expect(Email.isValid('user@subdomain.example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(Email.isValid('notanemail')).toBe(false);
      expect(Email.isValid('@nodomain.com')).toBe(false);
      expect(Email.isValid('no@domain')).toBe(false);
      expect(Email.isValid('spaces in@email.com')).toBe(false);
      expect(Email.isValid('')).toBe(false);
    });

    it('should return false for email without TLD', () => {
      expect(Email.isValid('test@localhost')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email with different case', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
