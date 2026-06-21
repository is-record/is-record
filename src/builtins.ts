/**
 * Type guards for common built-in object types. Brand checks use
 * `Object.prototype.toString` so they hold across realms (iframes, workers, vm
 * contexts) — except `isError`, which also accepts subclasses via `instanceof`.
 */

import { getTag } from './internal';

/** The fixed-width numeric typed-array views (excludes `DataView`). */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/** Narrows to `Date` (any instance, valid time or not). */
export function isDate(value: unknown): value is Date {
  return getTag(value) === '[object Date]';
}

/** Narrows to a `Date` holding a valid time (rejects `new Date('nope')`). */
export function isValidDate(value: unknown): value is Date {
  return isDate(value) && !Number.isNaN(value.getTime());
}

/** Narrows to `RegExp`. */
export function isRegExp(value: unknown): value is RegExp {
  return getTag(value) === '[object RegExp]';
}

/** Narrows to `Error` (and subclasses). */
export function isError(value: unknown): value is Error {
  return value instanceof Error || getTag(value) === '[object Error]';
}

/** Narrows to `Map`. */
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return getTag(value) === '[object Map]';
}

/** Narrows to `Set`. */
export function isSet(value: unknown): value is Set<unknown> {
  return getTag(value) === '[object Set]';
}

/** Narrows to `WeakMap`. */
export function isWeakMap(value: unknown): value is WeakMap<object, unknown> {
  return getTag(value) === '[object WeakMap]';
}

/** Narrows to `WeakSet`. */
export function isWeakSet(value: unknown): value is WeakSet<object> {
  return getTag(value) === '[object WeakSet]';
}

/**
 * Narrows to a thenable (`PromiseLike`): any object/function with a callable
 * `then`. Prefer this over `instanceof Promise` so foreign promises and other
 * thenables are recognised.
 */
export function isPromiseLike<T = unknown>(value: unknown): value is PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

/** Narrows to a native `Promise`. For any thenable, use `isPromiseLike`. */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return getTag(value) === '[object Promise]';
}

/** Narrows to `ArrayBuffer`. */
export function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return getTag(value) === '[object ArrayBuffer]';
}

/** Narrows to `DataView`. */
export function isDataView(value: unknown): value is DataView {
  return getTag(value) === '[object DataView]';
}

/** Narrows to any numeric {@link TypedArray} view (excludes `DataView`). */
export function isTypedArray(value: unknown): value is TypedArray {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * Narrows to a Node.js `Buffer` (typed as `Uint8Array`, which it extends, so no
 * `@types/node` dependency leaks into consumers). Returns `false` outside Node.
 */
export function isBuffer(value: unknown): value is Uint8Array {
  const B = (globalThis as { Buffer?: { isBuffer(v: unknown): boolean } }).Buffer;
  return B?.isBuffer(value) ?? false;
}
