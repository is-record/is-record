import { describe, expect, it } from 'bun:test';
import {
  isBigInt,
  isBoolean,
  isDefined,
  isFalsy,
  isFunction,
  isNil,
  isNull,
  isNumber,
  isPrimitive,
  isString,
  isSymbol,
  isTruthy,
  isUndefined,
} from '../src/index';

describe('primitive guards', () => {
  it('isString', () => {
    expect(isString('')).toBe(true);
    expect(isString(1)).toBe(false);
  });

  it('isNumber rejects NaN but accepts Infinity', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isNumber('1')).toBe(false);
  });

  it('isBoolean', () => {
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });

  it('isSymbol / isBigInt', () => {
    expect(isSymbol(Symbol('a'))).toBe(true);
    expect(isSymbol('a')).toBe(false);
    expect(isBigInt(1n)).toBe(true);
    expect(isBigInt(1)).toBe(false);
  });

  it('isFunction', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(class {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });

  it('isNull / isUndefined / isNil', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
  });

  it('isDefined filters nullish and narrows', () => {
    expect([1, null, 2, undefined].filter(isDefined)).toEqual([1, 2]);
  });

  it('isPrimitive', () => {
    for (const v of ['s', 1, true, null, undefined, Symbol(), 1n]) {
      expect(isPrimitive(v)).toBe(true);
    }
    for (const v of [{}, [], () => {}]) {
      expect(isPrimitive(v)).toBe(false);
    }
  });

  it('isTruthy / isFalsy', () => {
    expect([0, 1, '', 'a', null, undefined, false, true].filter(isTruthy)).toEqual([1, 'a', true]);
    expect(isFalsy(0)).toBe(true);
    expect(isFalsy('')).toBe(true);
    expect(isFalsy(null)).toBe(true);
    expect(isFalsy('x')).toBe(false);
  });
});
