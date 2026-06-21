/**
 * A single broad emptiness check across the common container shapes.
 */

/**
 * `true` when `value` carries no content:
 * - `null` / `undefined`
 * - empty string `''` (whitespace-only counts as non-empty — trim first if needed)
 * - empty array `[]`
 * - empty `Map` / `Set`
 * - plain object / record with no own enumerable keys
 *
 * Numbers, booleans, functions, and symbols are never "empty" → `false`.
 *
 * @example
 * isEmpty(null);   // true
 * isEmpty('');     // true
 * isEmpty([]);     // true
 * isEmpty({});     // true
 * isEmpty({ a: 1 }); // false
 * isEmpty(0);      // false
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
