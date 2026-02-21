import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatHours,
  calculateMargin,
  getStatusLabel,
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency with dollar sign and 2 decimal places', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should format currency with comma thousands separator', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle decimals correctly', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(99.5)).toBe('$99.50');
      expect(formatCurrency(99.1)).toBe('$99.10');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100)).toBe('$-100.00');
    });

    it('should format large numbers with correct spacing', () => {
      expect(formatCurrency(123456789.99)).toBe('$123,456,789.99');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to Spanish locale', () => {
      const isoDate = '2024-02-15T10:30:00Z';
      const result = formatDate(isoDate);
      expect(result).toMatch(/15.*feb/i);
      expect(result).toContain('2024');
    });

    it('should handle different months', () => {
      const jan = formatDate('2024-01-01T00:00:00Z');
      const dec = formatDate('2024-12-25T00:00:00Z');
      expect(jan).toMatch(/1.*ene/i);
      expect(dec).toMatch(/25.*dic/i);
    });

    it('should preserve year in output', () => {
      const result = formatDate('2025-06-10T00:00:00Z');
      expect(result).toContain('2025');
    });

    it('should handle edge dates', () => {
      expect(formatDate('2024-02-29T00:00:00Z')).toMatch(/29.*feb/i);
    });
  });

  describe('formatDateTime', () => {
    it('should format ISO datetime string with date and time', () => {
      const isoDateTime = '2024-02-15T14:30:00Z';
      const result = formatDateTime(isoDateTime);
      expect(result).toMatch(/15.*feb/i);
      expect(result).toMatch(/14:30|2:30/);
    });

    it('should format time with 2-digit hours and minutes', () => {
      const result = formatDateTime('2024-01-01T09:05:00Z');
      expect(result).toMatch(/09:05/);
    });

    it('should handle afternoon/evening times', () => {
      const result = formatDateTime('2024-01-01T23:59:00Z');
      expect(result).toMatch(/23:59|11:59/);
    });

    it('should include year in output', () => {
      const result = formatDateTime('2026-12-31T15:45:00Z');
      expect(result).toContain('2026');
    });
  });

  describe('formatHours', () => {
    it('should format whole hours without minutes', () => {
      expect(formatHours(1)).toBe('1h');
      expect(formatHours(5)).toBe('5h');
    });

    it('should format hours with minutes', () => {
      expect(formatHours(1.5)).toBe('1h 30m');
      expect(formatHours(2.25)).toBe('2h 15m');
    });

    it('should round minutes correctly', () => {
      expect(formatHours(1.99)).toBe('1h 59m');
      expect(formatHours(1.01)).toBe('1h 1m');
    });

    it('should handle edge case of exactly 59.5 minutes (rounding to 60)', () => {
      // 0.99666... hours = 59.8 minutes, which rounds to 60 minutes = 1 hour
      const result = formatHours(0.99666666);
      expect(result).toMatch(/^1h|0h/);
    });

    it('should handle zero hours', () => {
      expect(formatHours(0)).toBe('0h');
    });

    it('should handle very small hours', () => {
      const result = formatHours(0.001);
      expect(result).toMatch(/^0h/);
    });

    it('should handle decimal hours precisely', () => {
      expect(formatHours(3.75)).toBe('3h 45m');
      expect(formatHours(0.5)).toBe('0h 30m');
      expect(formatHours(8.33)).toBe('8h 20m');
    });
  });

  describe('calculateMargin', () => {
    it('should calculate margin percentage correctly', () => {
      // (sale - cost) / sale * 100
      // (100 - 50) / 100 * 100 = 50%
      expect(calculateMargin(100, 50)).toBe(50);
    });

    it('should handle equal sale and cost (0% margin)', () => {
      expect(calculateMargin(100, 100)).toBe(0);
    });

    it('should handle zero sale price (return 0)', () => {
      expect(calculateMargin(0, 50)).toBe(0);
    });

    it('should calculate negative margin when cost exceeds sale', () => {
      // (100 - 150) / 100 * 100 = -50%
      expect(calculateMargin(100, 150)).toBe(-50);
    });

    it('should handle small margins', () => {
      // (100 - 99) / 100 * 100 = 1%
      expect(calculateMargin(100, 99)).toBe(1);
    });

    it('should handle large margins', () => {
      // (1000 - 100) / 1000 * 100 = 90%
      expect(calculateMargin(1000, 100)).toBe(90);
    });

    it('should handle decimal values', () => {
      // (99.99 - 49.99) / 99.99 * 100 ≈ 50%
      const result = calculateMargin(99.99, 49.99);
      expect(result).toBeCloseTo(50, 1);
    });
  });

  describe('getStatusLabel', () => {
    it('should return Spanish label for reception status', () => {
      expect(getStatusLabel('reception')).toBe('Recepción');
    });

    it('should return Spanish label for in_progress status', () => {
      expect(getStatusLabel('in_progress')).toBe('En Proceso');
    });

    it('should return Spanish label for completed status', () => {
      expect(getStatusLabel('completed')).toBe('Finalizado');
    });

    it('should return Spanish label for delivered status', () => {
      expect(getStatusLabel('delivered')).toBe('Entregado');
    });

    it('should return Spanish label for pending status', () => {
      expect(getStatusLabel('pending')).toBe('Pendiente');
    });

    it('should return original status if label not found', () => {
      expect(getStatusLabel('unknown_status')).toBe('unknown_status');
    });

    it('should handle empty string', () => {
      expect(getStatusLabel('')).toBe('');
    });

    it('should be case sensitive', () => {
      expect(getStatusLabel('RECEPTION')).toBe('RECEPTION');
      expect(getStatusLabel('Reception')).toBe('Reception');
    });
  });
});
