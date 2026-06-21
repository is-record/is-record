#!/usr/bin/env bun
/**
 * One-shot manual release: stamp + build + publish BOTH npm packages
 * (`is-record` + `isrecord`), commit the version bump, tag it, and force-push
 * the code + tags to BOTH GitHub remotes (is-record + isrecord).
 *
 * This is the "do everything" escape hatch for when you don't want to go
 * through the CI semantic-release pipeline. For normal flow, just push
 * conventional commits to `master` and let `.github/workflows/release.yml`
 * handle it.
 *
 * Usage:
 *   bun run ship <version> [--dry-run] [--tag <dist-tag>] [--no-git]
 *
 * Examples:
 *   bun run ship 1.0.0 --dry-run        # full rehearsal, nothing published/pushed
 *   bun run ship 1.0.0                  # publish both packages + tag + push both repos
 *   bun run ship 1.1.0-beta.1 --tag beta
 *
 * Prerequisites: `npm login` (npm whoami must work) and SSH access to both repos.
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

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: bun run ship <semver> [--dry-run] [--tag <dist-tag>] [--no-git]');
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

// 1. Publish both npm packages (stamps version + builds inside release-local).
const releaseArgs = ['run', 'scripts/release-local.mjs', version];
if (dryRun) releaseArgs.push('--dry-run');
if (distTag) releaseArgs.push('--tag', distTag);
run('bun', releaseArgs);

// 2. Commit the version bump + tag it.
if (!noGit) {
  run('git', ['add', 'package.json']);
  run('git', ['commit', '-m', `chore(release): v${version}`, '--allow-empty']);
  run('git', ['tag', '-f', `v${version}`]);

  // 3. Force-push branch + tags to both remotes.
  const syncArgs = ['run', 'scripts/sync-repos.mjs'];
  if (dryRun) syncArgs.push('--dry-run');
  run('bun', syncArgs);
}

console.log(
  dryRun
    ? '\n✓ Dry-run complete. Re-run without --dry-run to ship for real.'
    : `\n✓ Shipped v${version}: is-record + isrecord published, code + tags pushed to both repos.`
);
