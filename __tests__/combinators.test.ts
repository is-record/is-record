import { describe, expect, it } from 'bun:test';
import { isNumber, isOneOf, isRecordOf, isString, not, nullable, optional, union } from '../src/index';

describe('combinators', () => {
  it('not', () => {
    const notString = not(isString);
    expect(notString(1)).toBe(true);
    expect(notString('a')).toBe(false);
  });

  it('union', () => {
    const isId = union(isString, isNumber);
    expect(isId('a')).toBe(true);
    expect(isId(1)).toBe(true);
    expect(isId(true)).toBe(false);
  });

  it('optional / nullable', () => {
    const maybeStr = optional(isString);
    expect(maybeStr(undefined)).toBe(true);
    expect(maybeStr('a')).toBe(true);
    expect(maybeStr(null)).toBe(false);

    const nullableStr = nullable(isString);
    expect(nullableStr(null)).toBe(true);
    expect(nullableStr('a')).toBe(true);
    expect(nullableStr(undefined)).toBe(false);
  });

  it('isOneOf', () => {
    expect(isOneOf('GET', ['GET', 'POST'] as const)).toBe(true);
    expect(isOneOf('PUT', ['GET', 'POST'] as const)).toBe(false);
  });

  it('isRecordOf', () => {
    const isStringMap = isRecordOf(isString);
    expect(isStringMap({ a: 'x', b: 'y' })).toBe(true);
    expect(isStringMap({ a: 'x', b: 1 })).toBe(false);
    expect(isStringMap([])).toBe(false);
  });
});
