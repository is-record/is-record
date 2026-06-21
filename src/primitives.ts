/**
 * Core primitive type guards (`typeof`-based) and the nullish/truthiness family.
 */

/** Narrows to `string`. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Narrows to `number`, excluding `NaN`. `Infinity`/`-Infinity` pass — they are
 * valid numbers. Use `isFiniteNumber` to also reject those.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** Narrows to `boolean`. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Narrows to `symbol`. */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

/** Narrows to `bigint`. */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

/** Narrows to any callable (`function`, classes, async/generator functions). */
// biome-ignore lint/complexity/noBannedTypes: `Function` is the correct guard target here.
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/** Narrows to exactly `null`. */
export function isNull(value: unknown): value is null {
  return value === null;
}

/** Narrows to exactly `undefined`. */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/** Narrows to `null | undefined`. */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Inverse of `isNil`: narrows away `null | undefined`, preserving the input's
 * non-nullish type. Ideal as an array filter predicate.
 *
 * @example
 * const xs = [1, null, 2, undefined].filter(isDefined); // number[]
 */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Narrows to a primitive: `string | number | boolean | symbol | bigint | null |
 * undefined`. Objects, arrays, and functions are not primitives.
 */
export function isPrimitive(value: unknown): value is string | number | boolean | symbol | bigint | null | undefined {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

/**
 * Narrows away `null | undefined` for any truthy value. At runtime also filters
 * `false`, `0`, `''`, `NaN`, so it doubles as a `.filter` predicate that keeps
 * meaningful values.
 *
 * @example
 * const xs = [0, 1, '', 'a', null].filter(isTruthy); // (number | string)[]
 */
export function isTruthy<T>(value: T): value is NonNullable<T> {
  return Boolean(value);
}

/** `true` for any falsy value (`false`, `0`, `0n`, `''`, `null`, `undefined`, `NaN`). */
export function isFalsy(value: unknown): boolean {
  return !value;
}
