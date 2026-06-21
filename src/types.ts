/**
 * Shared types for composing guards.
 */

/** A type-guard predicate: narrows `unknown` to `T`. */
export type Guard<T> = (value: unknown) => value is T;

/** Extract the guarded type `T` out of a `Guard<T>`. */
export type GuardType<G> = G extends Guard<infer T> ? T : never;

/** A non-empty array — at least one element, known to the type system. */
export type NonEmptyArray<T> = [T, ...T[]];
