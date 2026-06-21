#!/usr/bin/env bun
/**
 * Publish the built package under a *mirror* name (default: `isrecord`) so the
 * same code ships under both `is-record` and `isrecord`. The primary package
 * is published by semantic-release (CI) or `release:local`; this script ships
 * the alias from the exact same `dist/`.
 *
 * It temporarily rewrites the `name` field in package.json, publishes, then
 * restores the original name in a `finally` so the working tree is never left
 * dirty — even if publish fails.
 *
 * Usage:
 *   bun run scripts/publish-mirror.mjs [--name <pkg>] [--tag <dist-tag>] [--dry-run] [--no-provenance]
 *
 * Examples:
 *   bun run publish:mirror                       # publish `isrecord` from current dist
 *   bun run publish:mirror --dry-run             # validate without publishing
 *   bun run publish:mirror --tag beta            # publish under the `beta` dist-tag
 *   bun run publish:mirror --no-provenance       # local publish (provenance needs CI OIDC)
 *
 * Prerequisites: `dist/` must already be built (`bun run build`) and `npm whoami`
 * must succeed (run `npm login` first for non-dry runs).
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const pkgPath = resolve(ROOT, 'package.json');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
};

const mirrorName = valueOf('--name') ?? 'isrecord';
const distTag = valueOf('--tag');
const dryRun = has('--dry-run');
const provenance = !has('--no-provenance');

const original = readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(original);
const primaryName = pkg.name;

if (mirrorName === primaryName) {
  console.error(`✗ mirror name "${mirrorName}" matches the primary name — nothing to do.`);
  process.exit(1);
}

if (!dryRun) {
  const who = spawnSync('npm', ['whoami'], { stdio: 'pipe' });
  if (who.status !== 0) {
    console.error('✗ `npm whoami` failed — run `npm login` first.');
    process.exit(1);
  }
  console.log(`✓ npm user: ${who.stdout.toString().trim()}`);
}

console.log(
  `\n=== Mirror publish: ${mirrorName}@${pkg.version}${dryRun ? ' (dry run)' : ''}${distTag ? ` [tag=${distTag}]` : ''} ===`
);

let status = 1;
try {
  // Swap in the mirror name (keeping byte-for-byte formatting otherwise).
  writeFileSync(pkgPath, original.replace(`"name": "${primaryName}"`, `"name": "${mirrorName}"`));

  const publishArgs = ['publish', '--access', 'public', `--provenance=${provenance}`];
  if (dryRun) publishArgs.push('--dry-run');
  if (distTag) publishArgs.push('--tag', distTag);

  console.log(`\n→ npm ${publishArgs.join(' ')}`);
  status = spawnSync('npm', publishArgs, { stdio: 'inherit', cwd: ROOT }).status ?? 1;
} finally {
  // Always restore the original package.json so the repo is left clean — even on
  // failure. (Never call process.exit() before this point: it skips `finally`.)
  writeFileSync(pkgPath, original);
  console.log(`✓ restored package.json name to "${primaryName}"`);
}

if (status !== 0) {
  console.error(`\n✗ npm publish for ${mirrorName} exited with ${status}`);
  process.exit(status);
}

console.log(
  dryRun
    ? `\n✓ Dry-run complete for ${mirrorName}. Re-run without --dry-run to publish.`
    : `\n✓ Published ${mirrorName}@${pkg.version}.`
);
