#!/usr/bin/env bun
/**
 * Local release helper: stamp version → build → publish BOTH package names
 * (`is-record` and the `isrecord` mirror) to npm. For when CI is unavailable
 * or you want to ship a one-off (alpha/beta, or a hotfix while Actions is down).
 *
 * Usage:
 *   bun run release:local <version> [--dry-run] [--tag <dist-tag>] [--only-primary]
 *
 * Examples:
 *   bun run release:local 1.0.0 --dry-run
 *   bun run release:local 1.0.0
 *   bun run release:local 1.1.0-beta.1 --tag beta
 *
 * Prerequisites (one-time):
 *   1. `npm whoami`  — must show your npm user.
 *   2. `npm login`   — if (1) failed.
 *
 * Provenance:
 *   `publishConfig.provenance: true` keeps sigstore provenance on for CI (which
 *   has the OIDC id-token permission). This script publishes with
 *   `--provenance=false` because npm rejects provenance outside supported CI.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const pkgPath = resolve(ROOT, 'package.json');

const args = process.argv.slice(2);
const version = args.find((a) => !a.startsWith('--') && a !== process.argv[1]);
const dryRun = args.includes('--dry-run');
const onlyPrimary = args.includes('--only-primary');
const tagIdx = args.indexOf('--tag');
const distTag = tagIdx >= 0 ? args[tagIdx + 1] : null;

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: bun run release:local <semver> [--dry-run] [--tag <dist-tag>] [--only-primary]');
  console.error(`got: ${process.argv.slice(2).join(' ')}`);
  process.exit(1);
}

function run(cmd, runArgs, opts = {}) {
  console.log(`\n→ ${cmd} ${runArgs.join(' ')}`);
  const result = spawnSync(cmd, runArgs, { stdio: 'inherit', cwd: opts.cwd ?? ROOT });
  if (result.status !== 0) {
    console.error(`\n✗ ${cmd} ${runArgs.join(' ')} exited with ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

if (!dryRun) {
  const who = spawnSync('npm', ['whoami'], { stdio: 'pipe' });
  if (who.status !== 0) {
    console.error('✗ `npm whoami` failed — run `npm login` first.');
    process.exit(1);
  }
  console.log(`✓ npm user: ${who.stdout.toString().trim()}`);
}

console.log(`\n=== Local release: v${version}${dryRun ? ' (dry run)' : ''}${distTag ? ` [tag=${distTag}]` : ''} ===`);

// On a dry run, remember the original package.json so the stamp below doesn't
// persist — a rehearsal must leave the working tree clean.
const originalPkg = dryRun ? readFileSync(pkgPath, 'utf8') : null;

// 1. Stamp version into package.json so the build + publish carry it.
run('bun', ['run', 'scripts/stamp-version.mjs', version]);

// 2. Build (rollup → dist/).
run('bun', ['run', 'build']);

// 3. Publish the primary package (`is-record`). Provenance off — CI-only.
const publishArgs = ['publish', '--access', 'public', '--provenance=false'];
if (dryRun) publishArgs.push('--dry-run');
if (distTag) publishArgs.push('--tag', distTag);
run('npm', publishArgs);

// 4. Publish the `isrecord` mirror from the same dist/.
if (!onlyPrimary) {
  const mirrorArgs = ['run', 'scripts/publish-mirror.mjs', '--no-provenance'];
  if (dryRun) mirrorArgs.push('--dry-run');
  if (distTag) mirrorArgs.push('--tag', distTag);
  run('bun', mirrorArgs);
}

if (dryRun) {
  // Undo the version stamp so the rehearsal leaves no diff behind.
  if (originalPkg !== null) writeFileSync(pkgPath, originalPkg);
  console.log('\n✓ Dry-run complete (package.json restored). Re-run without --dry-run to publish.');
} else {
  console.log(`\n✓ Released v${version} (is-record${onlyPrimary ? '' : ' + isrecord'}).`);
  console.log("  Don't forget to:");
  console.log(`    git add package.json && git commit -m "chore(release): v${version}"`);
  console.log(`    git tag v${version} && git push --follow-tags`);
}
