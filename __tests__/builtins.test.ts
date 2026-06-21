import { describe, expect, it } from 'bun:test';
import {
  isArrayBuffer,
  isBuffer,
  isDataView,
  isDate,
  isError,
  isMap,
  isPromise,
  isPromiseLike,
  isRegExp,
  isSet,
  isTypedArray,
  isValidDate,
  isWeakMap,
  isWeakSet,
} from '../src/index';

describe('built-in guards', () => {
  it('isDate / isValidDate', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('nope'))).toBe(true);
    expect(isDate(Date.now())).toBe(false);
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('nope'))).toBe(false);
  });

  it('isRegExp / isError', () => {
    expect(isRegExp(/x/)).toBe(true);
    expect(isRegExp('x')).toBe(false);
    expect(isError(new TypeError('x'))).toBe(true);
    expect(isError({ message: 'x' })).toBe(false);
  });

  it('isMap / isSet / isWeakMap / isWeakSet', () => {
    expect(isMap(new Map())).toBe(true);
    expect(isSet(new Set())).toBe(true);
    expect(isWeakMap(new WeakMap())).toBe(true);
    expect(isWeakSet(new WeakSet())).toBe(true);
    expect(isMap(new Set())).toBe(false);
  });

  it('isPromise / isPromiseLike', () => {
    const native = Promise.resolve(1);
    // biome-ignore lint/suspicious/noThenProperty: deliberately testing a thenable.
    const thenable = { then() {} };
    expect(isPromise(native)).toBe(true);
    expect(isPromise(thenable)).toBe(false);
    expect(isPromiseLike(native)).toBe(true);
    expect(isPromiseLike(thenable)).toBe(true);
    expect(isPromiseLike({})).toBe(false);
  });

  it('isArrayBuffer / isDataView / isTypedArray', () => {
    const buf = new ArrayBuffer(8);
    expect(isArrayBuffer(buf)).toBe(true);
    expect(isDataView(new DataView(buf))).toBe(true);
    expect(isTypedArray(new Uint8Array(buf))).toBe(true);
    expect(isTypedArray(new Float64Array(1))).toBe(true);
    expect(isTypedArray(new DataView(buf))).toBe(false);
    expect(isTypedArray([])).toBe(false);
  });

  it('isBuffer', () => {
    const B = (globalThis as { Buffer?: { from(s: string): Uint8Array } }).Buffer;
    if (B) expect(isBuffer(B.from('x'))).toBe(true);
    expect(isBuffer(new Uint8Array(1))).toBe(false);
    expect(isBuffer('x')).toBe(false);
  });
});
