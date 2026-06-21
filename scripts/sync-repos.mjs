#!/usr/bin/env bun
/**
 * Push the canonical code (and tags) to BOTH GitHub remotes:
 *   - is-record  → git@github.com:is-record/is-record.git  (canonical / origin)
 *   - isrecord   → git@github.com:isrecord/isrecord.git    (mirror)
 *
 * The remotes are created on first run if missing. By default this force-pushes
 * the current branch and all tags to both — the mirror is a follower, so its
 * history is meant to be overwritten.
 *
 * Usage:
 *   bun run sync                      # force-push current branch + tags to both
 *   bun run sync --no-force           # fast-forward only (safe push)
 *   bun run sync --branch master      # push a specific branch
 *   bun run sync --only isrecord      # push to a single remote
 *   bun run sync --dry-run            # print what would run, do nothing
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const REMOTES = {
  'is-record': 'git@github.com:is-record/is-record.git',
  isrecord: 'git@github.com:isrecord/isrecord.git',
};

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
};

const force = !has('--no-force');
const dryRun = has('--dry-run');
const only = valueOf('--only');

function git(gitArgs, { capture = false } = {}) {
  if (dryRun && !capture) {
    console.log(`  (dry-run) git ${gitArgs.join(' ')}`);
    return { status: 0, stdout: '' };
  }
  const result = spawnSync('git', gitArgs, {
    cwd: ROOT,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });
  return result;
}

// Resolve the branch to push.
const branch = valueOf('--branch') ?? git(['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true }).stdout?.trim();
if (!branch || branch === 'HEAD') {
  console.error('✗ Could not resolve current branch (detached HEAD?). Pass --branch <name>.');
  process.exit(1);
}

const targets = only ? [only] : Object.keys(REMOTES);
for (const name of targets) {
  if (!REMOTES[name]) {
    console.error(`✗ Unknown remote "${name}". Known: ${Object.keys(REMOTES).join(', ')}`);
    process.exit(1);
  }
}

console.log(`\n=== Sync repos: branch "${branch}"${force ? ' (force)' : ''}${dryRun ? ' (dry run)' : ''} ===`);

// Ensure each remote exists and points at the expected URL.
for (const name of targets) {
  const url = REMOTES[name];
  const existing = git(['remote', 'get-url', name], { capture: true });
  if (existing.status !== 0) {
    console.log(`\n→ adding remote "${name}" → ${url}`);
    git(['remote', 'add', name, url]);
  } else if (existing.stdout.trim() !== url) {
    console.log(`\n→ updating remote "${name}" → ${url}`);
    git(['remote', 'set-url', name, url]);
  }
}

let failed = false;
for (const name of targets) {
  console.log(`\n→ pushing to "${name}" (${REMOTES[name]})`);
  const pushArgs = ['push', name, branch, '--tags'];
  if (force) pushArgs.push('--force');
  const result = git(pushArgs);
  if (result.status !== 0) {
    console.error(`✗ push to "${name}" failed (exit ${result.status}).`);
    failed = true;
  } else {
    console.log(`✓ pushed branch + tags to "${name}".`);
  }
}

if (failed) {
  console.error('\n✗ One or more pushes failed. Check SSH access to the repos above.');
  process.exit(1);
}

console.log(
  dryRun
    ? '\n✓ Dry-run complete. Re-run without --dry-run to push.'
    : `\n✓ Synced "${branch}" + tags to ${targets.join(' + ')}.`
);
