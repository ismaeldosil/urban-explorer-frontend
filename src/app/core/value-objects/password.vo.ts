import { DomainError } from '../errors/domain-error';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export class Password {
  private constructor(public readonly value: string) {}

  static create(password: string): Password {
    const validation = Password.validate(password);
    if (!validation.isValid) {
      throw new DomainError(validation.errors[0], 'INVALID_PASSWORD');
    }
    return new Password(password);
  }

  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return { isValid: errors.length === 0, errors };
  }

  static getStrength(password: string): PasswordStrength {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['danger', 'warning', 'warning', 'success', 'success'];

    return { score, label: labels[score], color: colors[score] };
  }
}
