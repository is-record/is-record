/**
 * The canonical "is this a record?" guard.
 *
 * A *record* is a non-null object that is not an array — i.e. the kind of value
 * you can safely index with string keys. This intentionally accepts class
 * instances, `Object.create(null)` objects, and exotic objects. For a stricter
 * "plain object literal" check, use {@link isPlainObject}.
 *
 * @example
 * isRecord({ a: 1 });        // true
 * isRecord(Object.create(null)); // true
 * isRecord([1, 2, 3]);       // false
 * isRecord(null);            // false
 * isRecord('hello');         // false
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
