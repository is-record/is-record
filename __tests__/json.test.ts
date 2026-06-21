import { describe, expect, it } from 'bun:test';
import { isJsonArray, isJsonObject, isJsonPrimitive, isJsonValue } from '../src/index';

describe('JSON guards', () => {
  it('isJsonPrimitive', () => {
    expect(isJsonPrimitive('a')).toBe(true);
    expect(isJsonPrimitive(1)).toBe(true);
    expect(isJsonPrimitive(true)).toBe(true);
    expect(isJsonPrimitive(null)).toBe(true);
    expect(isJsonPrimitive(Number.NaN)).toBe(false);
    expect(isJsonPrimitive(undefined)).toBe(false);
  });

  it('isJsonArray / isJsonObject', () => {
    expect(isJsonArray([1, 'a', null])).toBe(true);
    expect(isJsonArray([1, () => {}])).toBe(false);
    expect(isJsonObject({ a: 1, b: [true] })).toBe(true);
    expect(isJsonObject({ a: undefined })).toBe(false);
    expect(isJsonObject(new Date())).toBe(false);
  });

  it('isJsonValue recurses', () => {
    expect(isJsonValue({ a: [1, { b: 'c' }], d: null })).toBe(true);
    expect(isJsonValue({ a: () => {} })).toBe(false);
    expect(isJsonValue(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
