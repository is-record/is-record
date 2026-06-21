/**
 * Internal helpers — not part of the public API and not re-exported from the
 * barrel. Kept tiny and side-effect-free so bundlers can inline/drop them.
 */

/** `Object.prototype.toString` brand check — cross-realm safe (iframes, workers, vm). */
export const getTag = (value: unknown): string => Object.prototype.toString.call(value);
