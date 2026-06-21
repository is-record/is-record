/**
 * Numeric refinement guards. All narrow `unknown` to `number` and reject `NaN`.
 */

import { isNumber } from './primitives';

/** Narrows to a finite `number` (rejects `NaN`, `Infinity`, `-Infinity`). */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Narrows to an integer (`Number.isInteger`). */
export function isInteger(value: unknown): value is number {
  return Number.isInteger(value as number);
}

/** Narrows to a safe integer (`Number.isSafeInteger`). */
export function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value as number);
}

/** Narrows to a finite, non-integer `number` (e.g. `1.5`). */
export function isFloat(value: unknown): value is number {
  return isFiniteNumber(value) && !Number.isInteger(value);
}

/** Narrows to a `number` greater than `0`. */
export function isPositive(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/** Narrows to a `number` less than `0`. */
export function isNegative(value: unknown): value is number {
  return isNumber(value) && value < 0;
}

/** Narrows to a `number` greater than or equal to `0`. */
export function isNonNegative(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/** `true` for a true `NaN` value (typed `number` whose value is `NaN`). */
export function isNaNValue(value: unknown): boolean {
  return typeof value === 'number' && Number.isNaN(value);
}

/**
 * Narrows to a `number` within `[min, max]`. Pass `inclusive = false` for an
 * open `(min, max)` range.
 *
 * @example
 * isInRange(5, 1, 10);        // true
 * isInRange(10, 1, 10, false); // false
 */
export function isInRange(value: unknown, min: number, max: number, inclusive = true): value is number {
  if (!isNumber(value)) return false;
  return inclusive ? value >= min && value <= max : value > min && value < max;
}
