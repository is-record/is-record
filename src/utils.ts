/**
 * Small data-shaping utilities that pair naturally with the guards.
 */

/**
 * Normalise a value-or-array into an array. `null`/`undefined` become `[]`, so
 * it doubles as a nullish-safe "ensure array".
 *
 * @example
 * toArray(1);          // [1]
 * toArray([1, 2]);     // [1, 2]
 * toArray(undefined);  // []
 */
export function toArray<T>(value: T | readonly T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value as T];
}
