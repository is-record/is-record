/**
 * is-record — a tiny, dependency-free, tree-shakable collection of TypeScript
 * type guards, assertions, and combinators, headlined by {@link isRecord}.
 *
 * Every guard is a `value is T` predicate that narrows `unknown` to a concrete
 * type, so you can branch on shape without casts. Runs anywhere ES2020 does —
 * browser, Node, Bun, Deno — and ships both ESM and CJS with bundled types.
 */

// Assertions
export { assert, assertDefined, assertNever } from './assertions';
// Built-ins
export type { TypedArray } from './builtins';
export {
  isArrayBuffer,
  isBuffer,
  isDataView,
  isDate,
  isError,
  isMap,
  isPromise,
  isPromiseLike,
  isRegExp,
  isSet,
  isTypedArray,
  isValidDate,
  isWeakMap,
  isWeakSet,
} from './builtins';
// Guard combinators
export { isOneOf, isRecordOf, not, nullable, optional, union } from './combinators';
// Emptiness
export { isEmpty } from './emptiness';
// Refined functions
export { isAsyncFunction, isAsyncGeneratorFunction, isClass, isGeneratorFunction } from './functions';
// Headline guard
export { isRecord } from './is-record';
// Arrays & iterables
export { isArray, isArrayOf, isAsyncIterable, isEmptyArray, isIterable, isNonEmptyArray } from './iterables';
// JSON model & guards
export type { JsonArray, JsonObject, JsonPrimitive, JsonValue } from './json';
export { isJsonArray, isJsonObject, isJsonPrimitive, isJsonValue } from './json';
// Numeric refinements
export {
  isFiniteNumber,
  isFloat,
  isInRange,
  isInteger,
  isNaNValue,
  isNegative,
  isNonNegative,
  isPositive,
  isSafeInteger,
} from './numbers';
// Objects, keys & properties
export { hasOwn, isEmptyObject, isInstanceOf, isKeyOf, isObject, isPlainObject, isPropertyKey } from './objects';
// Primitives & nullish / truthiness
export {
  isBigInt,
  isBoolean,
  isDefined,
  isFalsy,
  isFunction,
  isNil,
  isNull,
  isNumber,
  isPrimitive,
  isString,
  isSymbol,
  isTruthy,
  isUndefined,
} from './primitives';
// Strings & format validators
export {
  isBase64,
  isBlankString,
  isEmail,
  isEmptyString,
  isJsonString,
  isNonEmptyString,
  isNumericString,
  isUrl,
  isUuid,
} from './strings';
// Shared types
export type { Guard, GuardType, NonEmptyArray } from './types';

// Utilities
export { toArray } from './utils';
