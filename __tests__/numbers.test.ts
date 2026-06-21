import { describe, expect, it } from 'bun:test';
import {
  isFiniteNumber,
  isFloat,
  isInRange,
  isInteger,
  isNaNValue,
  isNegative,
  isNonNegative,
  isPositive,
  isSafeInteger,
} from '../src/index';

describe('number guards', () => {
  it('isFiniteNumber rejects NaN and Infinity', () => {
    expect(isFiniteNumber(1.5)).toBe(true);
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NaN)).toBe(false);
  });

  it('isInteger vs isSafeInteger', () => {
    expect(isInteger(3)).toBe(true);
    expect(isInteger(3.1)).toBe(false);
    expect(isInteger(2 ** 53)).toBe(true);
    expect(isSafeInteger(2 ** 53)).toBe(false);
    expect(isSafeInteger(3)).toBe(true);
  });

  it('isFloat', () => {
    expect(isFloat(1.5)).toBe(true);
    expect(isFloat(2)).toBe(false);
    expect(isFloat(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('isPositive / isNegative / isNonNegative', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(0)).toBe(false);
    expect(isNonNegative(0)).toBe(true);
    expect(isNonNegative(-1)).toBe(false);
  });

  it('isNaNValue', () => {
    expect(isNaNValue(Number.NaN)).toBe(true);
    expect(isNaNValue(1)).toBe(false);
    expect(isNaNValue('x')).toBe(false);
  });

  it('isInRange', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10, false)).toBe(false);
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange('5', 1, 10)).toBe(false);
  });
});
