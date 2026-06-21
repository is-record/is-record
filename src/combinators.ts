/**
 * Guard combinators — build new guards from existing ones. Each returns a pure,
 * reusable predicate, so they compose cleanly and stay tree-shakable.
 */

import { isRecord } from './is-record';
import type { Guard, GuardType } from './types';

/**
 * Negate a guard. Returns a plain predicate (the negation can't be expressed as
 * a single narrow type, so the result is `(value) => boolean`).
 *
 * @example
 * const isNotString = not(isString);
 */
export function not<T>(guard: Guard<T>): (value: unknown) => boolean {
  return (value) => !guard(value);
}

/**
 * Combine guards into a union guard — passes if any input guard passes.
 *
 * @example
 * const isId = union(isString, isNumber); // Guard<string | number>
 */
export function union<const G extends readonly Guard<unknown>[]>(...guards: G): Guard<GuardType<G[number]>> {
  return (value): value is GuardType<G[number]> => guards.some((guard) => guard(value));
}

/** Wrap a guard to also accept `undefined` → `Guard<T | undefined>`. */
export function optional<T>(guard: Guard<T>): Guard<T | undefined> {
  return (value): value is T | undefined => value === undefined || guard(value);
}

/** Wrap a guard to also accept `null` → `Guard<T | null>`. */
export function nullable<T>(guard: Guard<T>): Guard<T | null> {
  return (value): value is T | null => value === null || guard(value);
}

/**
 * Narrows `value` to one of a fixed set of allowed values (membership check).
 *
 * @example
 * if (isOneOf(method, ['GET', 'POST'] as const)) method; // 'GET' | 'POST'
 */
export function isOneOf<const T extends readonly unknown[]>(value: unknown, options: T): value is T[number] {
  return (options as readonly unknown[]).includes(value);
}

/**
 * Build a guard for a record whose every value passes `valueGuard`.
 *
 * @example
 * const isStringMap = isRecordOf(isString); // Guard<Record<string, string>>
 */
export function isRecordOf<T>(valueGuard: Guard<T>): Guard<Record<string, T>> {
  return (value): value is Record<string, T> => isRecord(value) && Object.values(value).every((v) => valueGuard(v));
}
