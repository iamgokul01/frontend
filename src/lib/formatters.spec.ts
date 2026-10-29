import { describe, expect, it } from 'vitest';
import {
  formatCompactNumber,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  initialsOf,
} from './formatters';

describe('formatters', () => {
  it('compacts large numbers', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(940)).toBe('940');
    expect(formatCompactNumber(248_600)).toBe('248.6K');
    expect(formatCompactNumber(1_840_000)).toBe('1.84M');
  });

  it('formats plain numbers with separators', () => {
    expect(formatNumber(1420)).toBe('1,420');
  });

  it('formats percentages', () => {
    expect(formatPercent(13.46)).toBe('13.5%');
    expect(formatSignedPercent(18.4)).toBe('+18.4%');
    expect(formatSignedPercent(-4.2)).toBe('-4.2%');
    expect(formatSignedPercent(0)).toBe('0.0%');
  });

  it('derives initials', () => {
    expect(initialsOf('Sarah Connor')).toBe('SC');
    expect(initialsOf('Priya Nair')).toBe('PN');
    expect(initialsOf('Marcus')).toBe('M');
    expect(initialsOf('')).toBe('');
  });
});
