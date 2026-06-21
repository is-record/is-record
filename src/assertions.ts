/**
 * Assertion helpers using TypeScript's `asserts` narrowing. They throw on
 * failure and narrow the value (or control flow) for the rest of the scope —
 * the runtime counterpart to the guards in this package.
 */

/**
 * Throw if `condition` is falsy; otherwise narrow it to truthy.
 *
 * @example
 * assert(user, 'user is required');
 * user.id; // user is non-null here
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw new Error(message ?? 'Assertion failed');
}

/**
 * Throw if `value` is `null`/`undefined`; otherwise narrow away the nullish.
 *
 * @example
 * assertDefined(config.port);
 * config.port.toFixed(); // number, not number | undefined
 */
export function assertDefined<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Expected value to be defined');
  }
}

/**
 * Exhaustiveness helper — call in the `default`/`else` branch after handling
 * every case so the compiler errors if a case is ever added and left unhandled.
 *
 * @example
 * switch (shape.kind) {
 *   case 'circle': return area(shape);
 *   default: return assertNever(shape);
 * }
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${String(value)}`);
}
