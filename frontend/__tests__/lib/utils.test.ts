import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, truncateText } from '../../lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2025');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });
});