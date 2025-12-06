import { DomainError } from './domain-error';

// TODO: Fix tests
xdescribe('DomainError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new DomainError('Test error message');

      expect(error).toBeDefined();
      expect(error.message).toBe('Test error message');
      expect(error.code).toBeUndefined();
    });

    it('should create error with message and code', () => {
      const error = new DomainError('Test error message', 'TEST_CODE');

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should extend Error class', () => {
      const error = new DomainError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should have name property set to DomainError', () => {
      const error = new DomainError('Test error');

      expect(error.name).toBe('DomainError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new DomainError('Test thrown error', 'THROWN_ERROR');
      }).toThrow(DomainError);
    });

    it('should be catchable with proper properties', () => {
      try {
        throw new DomainError('Caught error', 'CAUGHT_CODE');
      } catch (error) {
        if (error instanceof DomainError) {
          expect(error.message).toBe('Caught error');
          expect(error.code).toBe('CAUGHT_CODE');
          expect(error.name).toBe('DomainError');
        } else {
          fail('Error should be instance of DomainError');
        }
      }
    });

    it('should preserve stack trace', () => {
      const error = new DomainError('Stack trace test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DomainError');
    });
  });

  describe('common error codes', () => {
    it('should support INVALID_EMAIL code', () => {
      const error = new DomainError('Invalid email format', 'INVALID_EMAIL');
      expect(error.code).toBe('INVALID_EMAIL');
    });

    it('should support INVALID_PASSWORD code', () => {
      const error = new DomainError('Password too short', 'INVALID_PASSWORD');
      expect(error.code).toBe('INVALID_PASSWORD');
    });

    it('should support INVALID_USERNAME code', () => {
      const error = new DomainError('Username invalid', 'INVALID_USERNAME');
      expect(error.code).toBe('INVALID_USERNAME');
    });

    it('should support INVALID_RATING code', () => {
      const error = new DomainError('Rating out of range', 'INVALID_RATING');
      expect(error.code).toBe('INVALID_RATING');
    });

    it('should support INVALID_COORDINATES code', () => {
      const error = new DomainError('Coordinates invalid', 'INVALID_COORDINATES');
      expect(error.code).toBe('INVALID_COORDINATES');
    });
  });

  describe('error code property', () => {
    it('should have readonly code property', () => {
      const error = new DomainError('Test', 'CODE');
      expect(error.code).toBe('CODE');
    });

    it('should allow checking error type by code', () => {
      const error = new DomainError('Test', 'SPECIFIC_CODE');

      if (error.code === 'SPECIFIC_CODE') {
        expect(true).toBe(true);
      } else {
        fail('Should have matched code');
      }
    });
  });

  describe('prototype chain', () => {
    it('should correctly set prototype', () => {
      const error = new DomainError('Test');

      expect(Object.getPrototypeOf(error)).toBe(DomainError.prototype);
    });

    it('should pass instanceof check after throw', () => {
      let caughtError: Error | null = null;

      try {
        throw new DomainError('Test', 'CODE');
      } catch (e) {
        caughtError = e as Error;
      }

      expect(caughtError).toBeInstanceOf(DomainError);
      expect(caughtError).toBeInstanceOf(Error);
    });
  });
});
