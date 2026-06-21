/**
 * Array and iterable type guards.
 */

import type { Guard, NonEmptyArray } from './types';

/** Narrows to `unknown[]`. Thin, well-typed wrapper over `Array.isArray`. */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Narrows to an array whose every element passes `guard`.
 *
 * @example
 * if (isArrayOf(value, isString)) value; // string[]
 */
export function isArrayOf<T>(value: unknown, guard: Guard<T>): value is T[] {
  return Array.isArray(value) && value.every((item) => guard(item));
}

/** Narrows to a non-empty array (`[T, ...T[]]`). */
export function isNonEmptyArray<T = unknown>(value: unknown): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

/** Narrows to an empty array (`[]`). */
export function isEmptyArray(value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Narrows to a sync iterable (anything implementing `Symbol.iterator`):
 * arrays, strings, `Map`, `Set`, generators, etc.
 */
export function isIterable<T = unknown>(value: unknown): value is Iterable<T> {
  return value != null && typeof (value as Iterable<T>)[Symbol.iterator] === 'function';
}

/** Narrows to an async iterable (anything implementing `Symbol.asyncIterator`). */
export function isAsyncIterable<T = unknown>(value: unknown): value is AsyncIterable<T> {
  return value != null && typeof (value as AsyncIterable<T>)[Symbol.asyncIterator] === 'function';
}
