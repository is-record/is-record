import { describe, expect, it } from 'bun:test';
import { isRecord } from '../src/index';

describe('isRecord', () => {
  it('accepts plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it('accepts null-prototype and class instances', () => {
    expect(isRecord(Object.create(null))).toBe(true);
    expect(isRecord(new Date())).toBe(true);
    expect(isRecord(new (class {})())).toBe(true);
  });

  it('rejects arrays', () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2])).toBe(false);
  });

  it('rejects null and primitives', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord('s')).toBe(false);
    expect(isRecord(1)).toBe(false);
    expect(isRecord(true)).toBe(false);
    expect(isRecord(Symbol())).toBe(false);
  });

  it('rejects functions', () => {
    expect(isRecord(() => {})).toBe(false);
    expect(isRecord(function named() {})).toBe(false);
  });

  it('narrows the type for the compiler', () => {
    const value: unknown = { id: 7 };
    if (isRecord(value)) {
      expect(value.id).toBe(7);
    }
  });
});
