import { describe, expect, it } from 'vitest';
import { percentOfCents, toCents, toDollars } from '../src/money';

describe('money helpers', () => {
  it('converts dollars to whole cents', () => {
    expect(toCents(19.99)).toBe(1999);
  });

  it('converts cents to dollars', () => {
    expect(toDollars(4034)).toBe(40.34);
  });

  it('takes a percentage of cents, rounding half up', () => {
    expect(percentOfCents(4746, 15)).toBe(712);
    expect(percentOfCents(1, 50)).toBe(1);
  });

  it('gives the whole amount for a 100% discount', () => {
    expect(percentOfCents(5000, 100)).toBe(5000);
  });
});
