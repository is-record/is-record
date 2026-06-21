#!/usr/bin/env bun
/**
 * Local release helper for THIS repo's package: stamp version → build →
 * publish to npm under whatever `name` is in package.json. For when CI is
 * unavailable or you want to ship a one-off (alpha/beta, or a hotfix while
 * Actions is down).
 *
 * Each package repo (is-record / isrecord / isguard) is standalone, so running
 * this inside a repo publishes that repo's own package name.
 *
 * Usage:
 *   bun run release:local <version> [--dry-run] [--tag <dist-tag>]
 *
 * Examples:
 *   bun run release:local 1.0.0 --dry-run
 *   bun run release:local 1.0.0
 *   bun run release:local 1.1.0-beta.1 --tag beta
 *
 * Prerequisites: `npm login` (npm whoami must work).
 *
 * Provenance is disabled here — it only works in supported CI with an OIDC
 * id-token. CI keeps `publishConfig.provenance: true`.
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
const tagIdx = args.indexOf('--tag');
const distTag = tagIdx >= 0 ? args[tagIdx + 1] : null;

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: bun run release:local <semver> [--dry-run] [--tag <dist-tag>]');
  console.error(`got: ${process.argv.slice(2).join(' ')}`);
  process.exit(1);
}

const name = JSON.parse(readFileSync(pkgPath, 'utf8')).name;

function run(cmd, runArgs) {
  console.log(`\n→ ${cmd} ${runArgs.join(' ')}`);
  const result = spawnSync(cmd, runArgs, { stdio: 'inherit', cwd: ROOT });
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

console.log(`\n=== Local release: ${name}@${version}${dryRun ? ' (dry run)' : ''}${distTag ? ` [tag=${distTag}]` : ''} ===`);

// On a dry run, restore package.json afterward so the rehearsal leaves no diff.
const originalPkg = dryRun ? readFileSync(pkgPath, 'utf8') : null;

run('bun', ['run', 'scripts/stamp-version.mjs', version]);
run('bun', ['run', 'build']);

const publishArgs = ['publish', '--access', 'public', '--provenance=false'];
if (dryRun) publishArgs.push('--dry-run');
if (distTag) publishArgs.push('--tag', distTag);
run('npm', publishArgs);

if (dryRun) {
  if (originalPkg !== null) writeFileSync(pkgPath, originalPkg);
  console.log('\n✓ Dry-run complete (package.json restored). Re-run without --dry-run to publish.');
} else {
  console.log(`\n✓ Released ${name}@${version}.`);
  console.log("  Don't forget to:");
  console.log(`    git commit -am "chore(release): v${version}" && git tag v${version} && git push --follow-tags`);
}
