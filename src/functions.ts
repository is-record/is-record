/**
 * Refined function guards: async, generator, async-generator, and class
 * constructors. For the broad "is it callable?" check, use `isFunction`.
 */

import { getTag } from './internal';

/** Narrows to an async function (`async () => {}`). */
export function isAsyncFunction(value: unknown): value is (...args: never[]) => Promise<unknown> {
  return getTag(value) === '[object AsyncFunction]';
}

/** Narrows to a generator function (`function* () {}`). */
export function isGeneratorFunction(value: unknown): value is (...args: never[]) => Generator<unknown> {
  return getTag(value) === '[object GeneratorFunction]';
}

/** Narrows to an async generator function (`async function* () {}`). */
export function isAsyncGeneratorFunction(value: unknown): value is (...args: never[]) => AsyncGenerator<unknown> {
  return getTag(value) === '[object AsyncGeneratorFunction]';
}

/**
 * Narrows to a class constructor (declared with `class`). Note: functions
 * usable as constructors via `new` but written as `function` are not detected —
 * this checks for the `class` syntax specifically.
 */
export function isClass(value: unknown): value is new (...args: never[]) => unknown {
  return typeof value === 'function' && /^class[\s{]/.test(Function.prototype.toString.call(value));
}
