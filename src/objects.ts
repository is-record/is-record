/**
 * Object-shaped type guards: broad `isObject`, strict `isPlainObject`,
 * emptiness, and property / key checks.
 */

import type { Guard } from './types';

/**
 * Narrows to any non-null `object` — includes arrays; excludes functions and
 * primitives. Broader than `isRecord`, which rejects arrays.
 */
export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * Strict plain-object guard: `true` only for object literals and
 * `Object.create(null)` objects. Rejects arrays, class instances, `Date`,
 * `Map`, and other exotic objects.
 *
 * @example
 * isPlainObject({ a: 1 });            // true
 * isPlainObject(Object.create(null)); // true
 * isPlainObject(new Date());          // false
 * isPlainObject([]);                  // false
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * `true` for a record/array/`Map`/`Set` that holds no entries. Non-collections
 * return `false`. Narrows to the empty-record type.
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value).length === 0;
}

/**
 * Type-safe own-property check: narrows `value` to additionally carry `key`.
 * Prefer this over `key in value` when you want to exclude inherited keys.
 *
 * @example
 * if (isRecord(x) && hasOwn(x, 'id')) x.id; // known property
 */
export function hasOwn<K extends PropertyKey>(value: object, key: K): value is Record<K, unknown> & typeof value {
  return Object.hasOwn(value, key);
}

/**
 * Narrows `key` to `keyof T` when it indexes `object`.
 *
 * @example
 * if (isKeyOf(config, k)) config[k]; // safe index
 */
export function isKeyOf<T extends object>(object: T, key: PropertyKey): key is keyof T {
  return key in object;
}

/**
 * Build a guard for `instanceof constructor`. Handy for composing with the
 * combinators or passing to `isArrayOf`.
 *
 * @example
 * const isDateValue = isInstanceOf(Date);
 * if (isDateValue(x)) x.getTime();
 */
export function isInstanceOf<C extends abstract new (...args: never[]) => unknown>(ctor: C): Guard<InstanceType<C>> {
  return (value): value is InstanceType<C> => value instanceof ctor;
}

/** Narrows to a `PropertyKey` (`string | number | symbol`). */
export function isPropertyKey(value: unknown): value is PropertyKey {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'symbol';
}
