#!/usr/bin/env bun
/**
 * One-shot manual release from the canonical repo:
 *   1. publish THIS package (is-record) to npm,
 *   2. commit + tag the version bump,
 *   3. push clean, name-transformed snapshots to all three package repos.
 *
 * The `isrecord` and `isguard` packages are published by their own repos' CI
 * once the synced `develop`/`master` push lands (each repo is standalone). For
 * the normal flow, just push conventional commits and let CI do everything.
 *
 * Usage:
 *   bun run ship <version> [--dry-run] [--tag <dist-tag>] [--branch <name>] [--no-git]
 *
 * Examples:
 *   bun run ship 1.0.0 --dry-run
 *   bun run ship 1.0.0
 *   bun run ship 1.1.0-beta.1 --tag beta --branch develop
 *
 * Prerequisites: `npm login` and SSH access to all three repos.
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const version = args.find((a) => !a.startsWith('--') && a !== process.argv[1]);
const dryRun = args.includes('--dry-run');
const noGit = args.includes('--no-git');
const tagIdx = args.indexOf('--tag');
const distTag = tagIdx >= 0 ? args[tagIdx + 1] : null;
const branchIdx = args.indexOf('--branch');
const branch = branchIdx >= 0 ? args[branchIdx + 1] : null;

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: bun run ship <semver> [--dry-run] [--tag <dist-tag>] [--branch <name>] [--no-git]');
  console.error(`got: ${process.argv.slice(2).join(' ')}`);
  process.exit(1);
}

function run(cmd, runArgs) {
  console.log(`\n→ ${cmd} ${runArgs.join(' ')}`);
  if (dryRun && (cmd === 'git' || cmd === 'npm')) {
    console.log('  (dry-run) skipped');
    return;
  }
  const result = spawnSync(cmd, runArgs, { stdio: 'inherit', cwd: ROOT });
  if (result.status !== 0) {
    console.error(`\n✗ ${cmd} ${runArgs.join(' ')} exited with ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\n=== Ship v${version}${dryRun ? ' (dry run)' : ''}${distTag ? ` [tag=${distTag}]` : ''} ===`);

// 1. Publish the canonical package (stamps version + builds inside release-local).
const releaseArgs = ['run', 'scripts/release-local.mjs', version];
if (dryRun) releaseArgs.push('--dry-run');
if (distTag) releaseArgs.push('--tag', distTag);
run('bun', releaseArgs);

// 2. Commit the version bump + tag it.
if (!noGit) {
  run('git', ['add', 'package.json']);
  run('git', ['commit', '-m', `chore(release): v${version}`, '--allow-empty']);
  run('git', ['tag', '-f', `v${version}`]);

  // 3. Push clean variants to all three repos.
  const syncArgs = ['run', 'scripts/sync-repos.mjs'];
  if (branch) syncArgs.push('--branch', branch);
  if (dryRun) syncArgs.push('--dry-run');
  run('bun', syncArgs);
}

console.log(
  dryRun
    ? '\n✓ Dry-run complete. Re-run without --dry-run to ship for real.'
    : `\n✓ Shipped is-record v${version} and pushed clean variants to is-record + isrecord + isguard.`
);
