import { formatDate, formatDateFull } from './format-date.util';

describe('formatDate', () => {
  describe('just now', () => {
    it('should return "Ahora" for current time', () => {
      const now = new Date();
      expect(formatDate(now)).toBe('Ahora');
    });

    it('should return "Ahora" for 30 seconds ago', () => {
      const date = new Date(Date.now() - 30 * 1000);
      expect(formatDate(date)).toBe('Ahora');
    });
  });

  describe('minutes', () => {
    it('should return "Hace 1 minuto" for 1 minute ago', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 minuto');
    });

    it('should return "Hace 2 minutos" for 2 minutes ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 minutos');
    });

    it('should return "Hace 30 minutos" for 30 minutes ago', () => {
      const date = new Date(Date.now() - 30 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 30 minutos');
    });

    it('should return "Hace 59 minutos" for 59 minutes ago', () => {
      const date = new Date(Date.now() - 59 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 59 minutos');
    });
  });

  describe('hours', () => {
    it('should return "Hace 1 hora" for 1 hour ago', () => {
      const date = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 hora');
    });

    it('should return "Hace 2 horas" for 2 hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 horas');
    });

    it('should return "Hace 12 horas" for 12 hours ago', () => {
      const date = new Date(Date.now() - 12 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 12 horas');
    });

    it('should return "Hace 23 horas" for 23 hours ago', () => {
      const date = new Date(Date.now() - 23 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 23 horas');
    });
  });

  describe('days', () => {
    it('should return "Hace 1 día" for 1 day ago', () => {
      const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 día');
    });

    it('should return "Hace 2 días" for 2 days ago', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 días');
    });

    it('should return "Hace 6 días" for 6 days ago', () => {
      const date = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 6 días');
    });
  });

  describe('weeks', () => {
    it('should return "Hace 1 semana" for 7 days ago', () => {
      const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 semana');
    });

    it('should return "Hace 2 semanas" for 14 days ago', () => {
      const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 semanas');
    });

    it('should return "Hace 4 semanas" for 28 days ago', () => {
      const date = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 4 semanas');
    });
  });

  describe('months', () => {
    it('should return "Hace 1 mes" for 30 days ago', () => {
      const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 mes');
    });

    it('should return "Hace 2 meses" for 60 days ago', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 meses');
    });

    it('should return "Hace 11 meses" for 330 days ago', () => {
      const date = new Date(Date.now() - 330 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 11 meses');
    });
  });

  describe('years', () => {
    it('should return "Hace 1 año" for 365 days ago', () => {
      const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 1 año');
    });

    it('should return "Hace 2 años" for 730 days ago', () => {
      const date = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 2 años');
    });

    it('should return "Hace 5 años" for 5 years ago', () => {
      const date = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
      expect(formatDate(date)).toBe('Hace 5 años');
    });
  });
});

describe('formatDateFull', () => {
  it('should format date in Spanish format', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const result = formatDateFull(date);

    // Result should contain day, month in Spanish, and year
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should handle different months', () => {
    const july = new Date(2024, 6, 1);
    const result = formatDateFull(july);

    expect(result).toContain('1');
    expect(result).toContain('2024');
  });

  it('should handle year 2000', () => {
    const date = new Date(2000, 5, 20);
    const result = formatDateFull(date);

    expect(result).toContain('20');
    expect(result).toContain('2000');
  });
});
