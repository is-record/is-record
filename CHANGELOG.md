# Changelog

All notable changes to **is-record** / **isrecord** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are cut automatically by [semantic-release](https://semantic-release.gitbook.io/)
from [Conventional Commits](https://www.conventionalcommits.org/) — `feat:` →
minor, `fix:` / `perf:` → patch, `BREAKING CHANGE:` → major. Per-release notes
are also published on the [GitHub Releases](https://github.com/is-record/is-record/releases)
page. Both npm packages (`is-record` and `isrecord`) ship from the same build,
so their versions stay in lockstep.

## [Unreleased]

## [1.0.0] - 2026-06-21

Initial release — a universal, tree-shakable type-guard toolkit (70+ exports).

### Added

- **Headline:** `isRecord`.
- **Objects:** `isObject`, `isPlainObject`, `isEmptyObject`, `hasOwn`, `isKeyOf`,
  `isInstanceOf`, `isPropertyKey`.
- **Primitives & nullish:** `isString`, `isNumber`, `isBoolean`, `isSymbol`,
  `isBigInt`, `isFunction`, `isNull`, `isUndefined`, `isNil`, `isDefined`,
  `isPrimitive`, `isTruthy`, `isFalsy`.
- **Numbers:** `isFiniteNumber`, `isInteger`, `isSafeInteger`, `isFloat`,
  `isPositive`, `isNegative`, `isNonNegative`, `isInRange`, `isNaNValue`.
- **Strings & validators:** `isNonEmptyString`, `isEmptyString`, `isBlankString`,
  `isNumericString`, `isJsonString`, `isUuid`, `isEmail`, `isUrl`, `isBase64`.
- **Functions:** `isAsyncFunction`, `isGeneratorFunction`,
  `isAsyncGeneratorFunction`, `isClass`.
- **Built-ins:** `isDate`, `isValidDate`, `isRegExp`, `isError`, `isMap`,
  `isSet`, `isWeakMap`, `isWeakSet`, `isPromise`, `isPromiseLike`,
  `isArrayBuffer`, `isDataView`, `isTypedArray`, `isBuffer`.
- **Arrays & iterables:** `isArray`, `isArrayOf`, `isNonEmptyArray`,
  `isEmptyArray`, `isIterable`, `isAsyncIterable`.
- **Emptiness:** `isEmpty`.
- **JSON:** `isJsonPrimitive`, `isJsonArray`, `isJsonObject`, `isJsonValue` plus
  the `JsonValue`/`JsonObject`/`JsonArray`/`JsonPrimitive` types.
- **Combinators:** `not`, `union`, `optional`, `nullable`, `isOneOf`,
  `isRecordOf`.
- **Assertions:** `assert`, `assertDefined`, `assertNever`.
- **Utilities & types:** `toArray`; `Guard`, `GuardType`, `NonEmptyArray`,
  `TypedArray`.
- Dual ESM (`.mjs`) + CJS (`.js`) bundles with bundled type declarations, zero
  runtime dependencies, `sideEffects: false`, ES2022 baseline. Universal across
  browser / Node 18+ / Bun / Deno.
- Dual publish under `is-record` and `isrecord` from the canonical
  `is-record/is-record` repo (mirrored to `isrecord/isrecord`).

[Unreleased]: https://github.com/is-record/is-record/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/is-record/is-record/releases/tag/v1.0.0
