import { describe, expect, it } from 'bun:test';
import { assert, assertDefined, assertNever, toArray } from '../src/index';

describe('assertions & utils', () => {
  it('assert throws on falsy', () => {
    expect(() => assert(false, 'boom')).toThrow('boom');
    expect(() => assert(1)).not.toThrow();
  });

  it('assertDefined throws on nullish and narrows', () => {
    expect(() => assertDefined(null)).toThrow();
    expect(() => assertDefined(undefined, 'missing')).toThrow('missing');
    const value: string | undefined = 'x';
    assertDefined(value);
    expect(value.length).toBe(1);
  });

  it('assertNever always throws', () => {
    expect(() => assertNever('x' as never, 'unexpected')).toThrow('unexpected');
  });

  it('toArray normalises', () => {
    expect(toArray(1)).toEqual([1]);
    expect(toArray([1, 2])).toEqual([1, 2]);
    expect(toArray(undefined)).toEqual([]);
    expect(toArray(null)).toEqual([]);
  });
});
