# AGENTS.md

Canonical contributor + agent guide for **is-record**. This is the single source
of truth for rules, code style, and patterns. `CLAUDE.md` and
`.github/copilot-instructions.md` only point here.

## What this is

A tiny, zero-dependency, tree-shakable collection of TypeScript type guards,
assertions, and combinators headlined by `isRecord` (70+ exports). Every guard
is a `value is T` predicate. **Universal** — runs in browsers, Node, Bun, and
Deno (ES2022 baseline; non-universal globals like `Buffer`/`URL` are
feature-detected). Published under two identical npm names: **`is-record`**
(canonical) and **`isrecord`** (mirror).

## Layout

```
src/
  internal.ts      # @internal getTag helper (not re-exported)
  types.ts         # Guard, GuardType, NonEmptyArray
  is-record.ts     # the headline guard
  primitives.ts    # typeof-core + nullish + isTruthy/isFalsy
  numbers.ts       # finite/integer/float/positive/range/NaN refinements
  strings.ts       # non-empty/blank/numeric/json + uuid/email/url/base64 validators
  objects.ts       # isObject, isPlainObject, isEmptyObject, hasOwn, isKeyOf, isInstanceOf, isPropertyKey
  functions.ts     # isAsync/Generator/AsyncGeneratorFunction, isClass
  builtins.ts      # Date/RegExp/Error/Map/Set/Weak*/Promise/ArrayBuffer/DataView/TypedArray/Buffer
  iterables.ts     # isArray(Of), isNonEmptyArray, isEmptyArray, is(Async)Iterable
  emptiness.ts     # isEmpty (broad container check)
  json.ts          # Json* model + guards
  combinators.ts   # not, union, optional, nullable, isOneOf, isRecordOf
  assertions.ts    # assert, assertDefined, assertNever
  utils.ts         # toArray
  index.ts         # barrel — re-exports everything (named exports only)
__tests__/         # one bun:test file per src module
scripts/           # release-local, publish-mirror, sync-repos, ship, stamp-version
```

## Code style

- **Named exports only** (never default). Add new guards to a category file,
  then re-export from `src/index.ts`.
- **Universal:** no `node:`/`bun:` imports in `src`. Feature-detect non-universal
  globals via guarded `globalThis` casts (see `isBuffer`, `isUrl`) so the emitted
  `.d.ts` needs neither `@types/node` nor the DOM lib. `tsconfig.json` sets
  `types: []` for exactly this reason.
- **Tree-shakable:** `sideEffects: false`; keep every export a pure function with
  no module-init side effects.
- kebab-case filenames; single quotes; 2-space indent; `es5` trailing commas.
  Biome (`biome.json`) is the formatter/linter of record — run `bun run check`.
- Every guard: `(value: unknown) => value is T`, early-return, no casts. No
  `any`, `as any`, or `@ts-ignore`. `Function` is allowed only in `isFunction`
  (Biome rule suppressed inline).
- Cross-realm built-in checks use `Object.prototype.toString` (see
  `builtins.ts`), not bare `instanceof` — except `isError`, which also accepts
  subclasses via `instanceof`.
- Keep it DRY and minimal: no single-use wrappers, no duplicated logic.

## Tooling

- **Runtime/build:** Bun + Rollup (`rollup.config.cjs`) → dual CJS (`.js`) + ESM
  (`.mjs`) + a single `.d.ts` pass. Single public entry (`src/index.ts`).
- **Lint/format:** Biome. **Typecheck:** `tsc` (strict) over `src` and tests.
- **Tests:** `bun test` in `__tests__/`.

Commands:

```bash
bun install
bun run lint        # biome check
bun run typecheck   # tsc strict (src + tests)
bun run test        # bun test
bun run build       # rollup → dist/
bun run check       # biome check --write (autofix)
```

## Release & publish

Two npm packages, one canonical repo (`is-record/is-record`), mirrored to
`isrecord/isrecord`.

- **Normal flow:** push conventional commits to `master`. `.github/workflows/`
  validates, then `semantic-release` publishes `is-record` with provenance and
  the mirror step publishes `isrecord` from the same `dist/`.
- **Manual one-shot:** `bun run ship <version>` — publishes both npm packages,
  commits + tags the bump, and force-pushes code + tags to both repos. Add
  `--dry-run` to rehearse.
- **Pieces** (if you need them individually):
  - `bun run release:local <version>` — publish both packages, no git.
  - `bun run publish:mirror` — publish only `isrecord` from current `dist/`.
  - `bun run sync` — force-push current branch + tags to both remotes.

Commit messages drive versioning (Angular preset): `feat:` → minor, `fix:` /
`perf:` → patch, `BREAKING CHANGE:` → major. `docs/chore/test/ci` don't release.

## Adding a guard (checklist)

1. Add `export function isThing(value: unknown): value is Thing` to the right
   category file with a JSDoc `@example`.
2. Re-export it (alphabetically) from `src/index.ts`.
3. Add cases to the matching `__tests__/*.test.ts` — include the negative cases.
4. Document it in the `README.md` API table.
5. `bun run check && bun run typecheck && bun run test`.
