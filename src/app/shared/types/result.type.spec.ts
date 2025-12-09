import { Result } from './result.type';

describe('Result Type', () => {
  describe('Result.ok', () => {
    it('should create success result with data', () => {
      const result = Result.ok('test data');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test data');
      }
    });

    it('should work with object data', () => {
      const data = { id: 1, name: 'test' };
      const result = Result.ok(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: 1, name: 'test' });
      }
    });

    it('should work with array data', () => {
      const data = [1, 2, 3];
      const result = Result.ok(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });

    it('should work with null data', () => {
      const result = Result.ok(null);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should work with undefined data', () => {
      const result = Result.ok(undefined);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should work with boolean data', () => {
      const result = Result.ok(true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should work with number data', () => {
      const result = Result.ok(42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });
  });

  describe('Result.fail', () => {
    it('should create failure result with error', () => {
      const error = new Error('Something went wrong');
      const result = Result.fail(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('should work with string error', () => {
      const result = Result.fail('error message');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('error message');
      }
    });

    it('should work with object error', () => {
      const error = { code: 'VALIDATION_ERROR', message: 'Invalid input' };
      const result = Result.fail(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual({ code: 'VALIDATION_ERROR', message: 'Invalid input' });
      }
    });

    it('should work with custom error type', () => {
      type CustomError = { code: string; details: string[] };
      const error: CustomError = { code: 'CUSTOM', details: ['detail1', 'detail2'] };
      const result = Result.fail<CustomError>(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CUSTOM');
        expect(result.error.details).toEqual(['detail1', 'detail2']);
      }
    });
  });

  describe('Type Guards', () => {
    it('should allow type narrowing for success result', () => {
      const result: Result<string, Error> = Result.ok('success');

      if (result.success) {
        // TypeScript should allow accessing data here
        const data: string = result.data;
        expect(data).toBe('success');
      }
    });

    it('should allow type narrowing for failure result', () => {
      const result: Result<string, Error> = Result.fail(new Error('failed'));

      if (!result.success) {
        // TypeScript should allow accessing error here
        const error: Error = result.error;
        expect(error.message).toBe('failed');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object data', () => {
      const result = Result.ok({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should handle empty array data', () => {
      const result = Result.ok([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should handle zero as data', () => {
      const result = Result.ok(0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should handle empty string as data', () => {
      const result = Result.ok('');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('');
      }
    });

    it('should handle false as data', () => {
      const result = Result.ok(false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });
  });
});
