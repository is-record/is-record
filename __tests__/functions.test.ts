import { describe, expect, it } from 'bun:test';
import { isAsyncFunction, isAsyncGeneratorFunction, isClass, isGeneratorFunction } from '../src/index';

describe('function guards', () => {
  it('isAsyncFunction', () => {
    expect(isAsyncFunction(async () => {})).toBe(true);
    expect(isAsyncFunction(() => {})).toBe(false);
  });

  it('isGeneratorFunction', () => {
    expect(isGeneratorFunction(function* () {})).toBe(true);
    expect(isGeneratorFunction(() => {})).toBe(false);
  });

  it('isAsyncGeneratorFunction', () => {
    expect(isAsyncGeneratorFunction(async function* () {})).toBe(true);
    expect(isAsyncGeneratorFunction(function* () {})).toBe(false);
  });

  it('isClass', () => {
    expect(isClass(class {})).toBe(true);
    expect(isClass(class Foo {})).toBe(true);
    expect(isClass(function Foo() {})).toBe(false);
    expect(isClass(() => {})).toBe(false);
  });
});
