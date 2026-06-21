<div align="center">

# is-record

**Tiny, dependency-free TypeScript type guards — headlined by `isRecord`.**

70+ `value is T` predicates, assertions, and combinators that narrow `unknown`
without a single cast. Zero dependencies, fully tree-shakable, ships **ESM +
CJS + types**. Runs anywhere ES2022 does — **browser, Node, Bun, Deno**.

[![npm: is-record](https://img.shields.io/npm/v/is-record?label=is-record)](https://www.npmjs.com/package/is-record)
[![npm: isrecord](https://img.shields.io/npm/v/isrecord?label=isrecord)](https://www.npmjs.com/package/isrecord)
[![types](https://img.shields.io/npm/types/is-record)](https://www.npmjs.com/package/is-record)
[![license](https://img.shields.io/npm/l/is-record)](./LICENSE)

</div>

---

## Install

Published under two identical names — pick whichever reads better to you:

```bash
npm install is-record      # or: isrecord
pnpm add is-record         # or: isrecord
yarn add is-record         # or: isrecord
bun add is-record          # or: isrecord
```

```ts
import { isRecord } from 'is-record'; // or 'isrecord'
```

**Deno** (no install needed):

```ts
import { isRecord } from 'npm:is-record';
```

## Why

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
```

That four-liner gets re-written, re-tested, and re-shipped in countless
codebases. This package is that guard done once, correctly — plus the whole
family of guards you always end up reaching for next to it (primitives, numbers,
strings, built-ins, JSON, combinators, assertions).

- **Zero dependencies.** Nothing transitive, nothing to audit.
- **Tree-shakable.** `sideEffects: false` + pure functions — your bundler keeps
  only the guards you import. Import one, ship one.
- **Universal.** No `node:` imports; non-universal globals (`Buffer`, `URL`) are
  feature-detected, so the same build runs in browsers, Node, Bun, and Deno.
- **Type-safe.** No `any` in the source; every guard returns a precise
  `value is T` predicate. The emitted `.d.ts` needs neither `@types/node` nor
  the DOM lib.

## Quick start

```ts
import { isRecord, isString, isArrayOf, isOneOf, assertDefined } from 'is-record';

function handle(input: unknown) {
  if (!isRecord(input)) throw new TypeError('expected an object');
  // input is Record<string, unknown>

  if (isString(input.name)) {
    input.name.trim(); // string
  }

  if (isArrayOf(input.tags, isString)) {
    input.tags.join(', '); // string[]
  }

  if (isOneOf(input.method, ['GET', 'POST'] as const)) {
    input.method; // 'GET' | 'POST'
  }

  assertDefined(input.id, 'id is required');
  return input.id; // narrowed: not null | undefined
}
```

## API

Every guard takes `(value: unknown)` and returns a type predicate unless noted.

### Records & objects

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isRecord` | `Record<string, unknown>` | Non-null object that isn't an array. Accepts class instances & null-prototype objects. |
| `isObject` | `object` | Any non-null object, **including** arrays. Excludes functions. |
| `isPlainObject` | `Record<string, unknown>` | Strict: only `{}` literals / null-prototype. Rejects `Date`, `Map`, arrays, class instances. |
| `isEmptyObject` | `Record<string, never>` | Empty record / array / `Map` / `Set`. |
| `hasOwn(value, key)` | `value & Record<K, unknown>` | Type-safe own-property check. |
| `isKeyOf(object, key)` | `key is keyof T` | Narrow a key to `keyof` an object. |
| `isInstanceOf(Ctor)` | `Guard<InstanceType<C>>` | Builds an `instanceof` guard. |
| `isPropertyKey` | `PropertyKey` | `string \| number \| symbol`. |

### Primitives & nullish

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isString` | `string` | |
| `isNumber` | `number` | Rejects `NaN`; accepts `Infinity`. |
| `isBoolean` | `boolean` | |
| `isSymbol` | `symbol` | |
| `isBigInt` | `bigint` | |
| `isFunction` | `Function` | Any callable. |
| `isNull` / `isUndefined` | `null` / `undefined` | |
| `isNil` | `null \| undefined` | |
| `isDefined` | `NonNullable<T>` | Inverse of `isNil`; great as a `.filter` predicate. |
| `isPrimitive` | `string \| number \| boolean \| symbol \| bigint \| null \| undefined` | |
| `isTruthy` | `NonNullable<T>` | Filters out all falsy values at runtime. |
| `isFalsy` | `boolean` | |

### Numbers

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isFiniteNumber` | `number` | Rejects `NaN`, `Infinity`, `-Infinity`. |
| `isInteger` | `number` | `Number.isInteger`. |
| `isSafeInteger` | `number` | `Number.isSafeInteger`. |
| `isFloat` | `number` | Finite, non-integer. |
| `isPositive` / `isNegative` | `number` | `> 0` / `< 0`. |
| `isNonNegative` | `number` | `>= 0`. |
| `isInRange(value, min, max, inclusive?)` | `number` | Inclusive by default. |
| `isNaNValue` | `boolean` | True `NaN` check. |

### Strings & validators

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isNonEmptyString` | `string` | Length > 0. |
| `isEmptyString` | `string` | `''`. |
| `isBlankString` | `string` | Empty or whitespace-only. |
| `isNumericString` | `string` | Parses as a finite number. |
| `isJsonString` | `string` | Parses as JSON without throwing. |
| `isUuid` | `string` | RFC 4122 shape (any version). |
| `isEmail` | `string` | Pragmatic shape check. |
| `isUrl` | `string` | Parses via the `URL` constructor. |
| `isBase64` | `string` | Valid standard Base64. |

> Validators are pragmatic shape checks for guarding tool inputs and payloads —
> not RFC-exhaustive parsers for security-critical use.

### Functions

| Guard | Narrows to |
| --- | --- |
| `isAsyncFunction` | `(...args) => Promise<unknown>` |
| `isGeneratorFunction` | `(...args) => Generator<unknown>` |
| `isAsyncGeneratorFunction` | `(...args) => AsyncGenerator<unknown>` |
| `isClass` | `new (...args) => unknown` (class syntax) |

### Built-ins

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isDate` / `isValidDate` | `Date` | `isValidDate` rejects `Invalid Date`. |
| `isRegExp` | `RegExp` | |
| `isError` | `Error` | Includes subclasses. |
| `isMap` / `isSet` | `Map` / `Set` | Cross-realm safe. |
| `isWeakMap` / `isWeakSet` | `WeakMap` / `WeakSet` | |
| `isPromise` | `Promise<T>` | Native promises only. |
| `isPromiseLike` | `PromiseLike<T>` | Any thenable. |
| `isArrayBuffer` / `isDataView` | `ArrayBuffer` / `DataView` | |
| `isTypedArray` | `TypedArray` | Any numeric typed-array view. |
| `isBuffer` | `Uint8Array` | Node `Buffer`; `false` elsewhere (no `@types/node` needed). |

### Arrays & iterables

| Guard | Narrows to | Notes |
| --- | --- | --- |
| `isArray` | `unknown[]` | Well-typed `Array.isArray`. |
| `isArrayOf(value, guard)` | `T[]` | Array whose every element passes `guard`. |
| `isNonEmptyArray` | `[T, ...T[]]` | |
| `isEmptyArray` | `[]` | |
| `isIterable` | `Iterable<T>` | Implements `Symbol.iterator`. |
| `isAsyncIterable` | `AsyncIterable<T>` | Implements `Symbol.asyncIterator`. |

### Emptiness

| Guard | Returns | Notes |
| --- | --- | --- |
| `isEmpty` | `boolean` | True for nil, `''`, `[]`, `{}`, empty `Map`/`Set`. |

### JSON

`isJsonPrimitive`, `isJsonArray`, `isJsonObject`, `isJsonValue` — recursively
verify a value is JSON-safe (e.g. before `JSON.stringify`, or to validate a
decoded payload). Exposed types: `JsonValue`, `JsonObject`, `JsonArray`,
`JsonPrimitive`.

```ts
import { isJsonValue } from 'is-record';

isJsonValue({ a: [1, { b: 'c' }], d: null }); // true
isJsonValue({ fn: () => {} });                 // false
```

### Combinators

Build new guards from existing ones — every combinator returns a reusable,
tree-shakable predicate.

| Combinator | Result | Notes |
| --- | --- | --- |
| `union(...guards)` | `Guard<A \| B \| …>` | Passes if any guard passes. |
| `optional(guard)` | `Guard<T \| undefined>` | |
| `nullable(guard)` | `Guard<T \| null>` | |
| `not(guard)` | `(value) => boolean` | Negation. |
| `isOneOf(value, options)` | `value is options[number]` | Literal membership check. |
| `isRecordOf(valueGuard)` | `Guard<Record<string, T>>` | Record with all-`T` values. |

```ts
import { union, optional, isRecordOf, isString, isNumber } from 'is-record';

const isId = union(isString, isNumber);     // Guard<string | number>
const isMaybeName = optional(isString);     // Guard<string | undefined>
const isStringMap = isRecordOf(isString);   // Guard<Record<string, string>>
```

### Assertions

Throw on failure and narrow for the rest of the scope (TypeScript `asserts`).

| Assertion | Effect |
| --- | --- |
| `assert(condition, message?)` | Throws if falsy; narrows to truthy. |
| `assertDefined(value, message?)` | Throws if nullish; narrows away `null \| undefined`. |
| `assertNever(value, message?)` | Exhaustiveness guard for `switch`/`default`. |

```ts
import { assertNever } from 'is-record';

function area(shape: Circle | Square): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'square': return shape.side ** 2;
    default: return assertNever(shape); // compile error if a case is added
  }
}
```

### Utilities & types

- `toArray(value)` — normalise a value-or-array (and nullish) into an array.
- Exposed types: `Guard<T>`, `GuardType<G>`, `NonEmptyArray<T>`, plus the JSON
  and `TypedArray` types above.

```ts
import type { Guard } from 'is-record';

function parseList<T>(input: unknown, guard: Guard<T>): T[] {
  return Array.isArray(input) ? input.filter(guard) : [];
}
```

## Compatibility & bundling

- **ESM & CommonJS** via the `exports` map (`import` → `.mjs`, `require` → `.js`).
- **Types** bundled (`dist/index.d.ts`) — no extra `@types` needed.
- **Tree-shaking:** `"sideEffects": false`; importing one guard pulls in only
  that guard. With CJS (`require`), you get the whole module — use ESM for
  shaking.
- **Baseline:** ES2022. Works in all current browsers, Node 18+, Bun, and Deno.

## Contributing

See [AGENTS.md](./AGENTS.md) for layout, conventions, and the
"add a guard" checklist. In short:

```bash
bun install
bun run check      # biome lint + format (autofix)
bun run typecheck  # tsc strict
bun run test       # bun test
bun run build      # rollup → dist/
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md). `is-record` and `isrecord` ship from the
same build and share version numbers.

## License

[MIT](./LICENSE) © Mohamed Meabed
