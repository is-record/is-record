import { describe, expect, it } from 'bun:test';
import { isArray, isArrayOf, isAsyncIterable, isEmptyArray, isIterable, isNonEmptyArray, isString } from '../src/index';

describe('iterable guards', () => {
  it('isArray', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
  });

  it('isArrayOf', () => {
    expect(isArrayOf(['a', 'b'], isString)).toBe(true);
    expect(isArrayOf(['a', 1], isString)).toBe(false);
    expect(isArrayOf([], isString)).toBe(true);
    expect(isArrayOf('a', isString)).toBe(false);
  });

  it('isNonEmptyArray / isEmptyArray', () => {
    expect(isNonEmptyArray([1])).toBe(true);
    expect(isNonEmptyArray([])).toBe(false);
    expect(isNonEmptyArray('ab')).toBe(false);
    expect(isEmptyArray([])).toBe(true);
    expect(isEmptyArray([1])).toBe(false);
  });

  it('isIterable', () => {
    expect(isIterable([])).toBe(true);
    expect(isIterable('abc')).toBe(true);
    expect(isIterable(new Map())).toBe(true);
    expect(isIterable({})).toBe(false);
    expect(isIterable(null)).toBe(false);
  });

  it('isAsyncIterable', () => {
    async function* gen() {
      yield 1;
    }
    expect(isAsyncIterable(gen())).toBe(true);
    expect(isAsyncIterable([])).toBe(false);
    expect(isAsyncIterable(null)).toBe(false);
  });
});
