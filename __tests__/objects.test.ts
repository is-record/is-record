import { describe, expect, it } from 'bun:test';
import { hasOwn, isEmptyObject, isInstanceOf, isKeyOf, isObject, isPlainObject, isPropertyKey } from '../src/index';

describe('object guards', () => {
  it('isObject accepts any non-null object incl arrays', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(new Date())).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject(() => {})).toBe(false);
    expect(isObject(1)).toBe(false);
  });

  it('isPlainObject is strict', () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new (class {})())).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });

  it('isEmptyObject', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject({ a: 1 })).toBe(false);
    expect(isEmptyObject([])).toBe(true);
    expect(isEmptyObject(new Map())).toBe(true);
    expect(isEmptyObject(new Set([1]))).toBe(false);
    expect(isEmptyObject(null)).toBe(false);
  });

  it('hasOwn narrows own properties only', () => {
    const obj: object = { id: 5 };
    expect(hasOwn(obj, 'id')).toBe(true);
    expect(hasOwn(obj, 'toString')).toBe(false);
    if (hasOwn(obj, 'id')) expect(obj.id).toBe(5);
  });

  it('isKeyOf', () => {
    const cfg = { host: 'x', port: 1 };
    expect(isKeyOf(cfg, 'host')).toBe(true);
    expect(isKeyOf(cfg, 'missing')).toBe(false);
  });

  it('isInstanceOf builds a guard', () => {
    const isDateValue = isInstanceOf(Date);
    expect(isDateValue(new Date())).toBe(true);
    expect(isDateValue({})).toBe(false);
  });

  it('isPropertyKey', () => {
    expect(isPropertyKey('a')).toBe(true);
    expect(isPropertyKey(1)).toBe(true);
    expect(isPropertyKey(Symbol())).toBe(true);
    expect(isPropertyKey({})).toBe(false);
    expect(isPropertyKey(null)).toBe(false);
  });
});
