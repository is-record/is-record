#!/usr/bin/env bun
/**
 * Publish the source tree to every package repo, cleanly. The canonical
 * `is-record` repo gets a normal push (real history); the `isrecord` and
 * `isguard` repos get a name-transformed snapshot force-pushed to them, so each
 * repo holds a self-consistent standalone package.
 *
 * Usage:
 *   bun run sync                       # push current branch to all three repos
 *   bun run sync --branch develop      # push a specific branch
 *   bun run sync --only isguard        # push a single variant
 *   bun run sync --no-force            # safe push for the canonical repo
 *   bun run sync --dry-run             # print actions, change nothing
 *
 * Snapshots are built with `git archive` of the chosen ref, transformed in a
 * temp dir, committed fresh, and force-pushed — the follower repos are
 * generated artifacts, so their history is meant to be overwritten.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyVariant, CANONICAL, VARIANTS } from './variants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
};

const force = !has('--no-force');
const dryRun = has('--dry-run');
const only = valueOf('--only');

function git(gitArgs, opts = {}) {
  const result = spawnSync('git', gitArgs, { cwd: opts.cwd ?? ROOT, stdio: opts.capture ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (!opts.capture && !opts.allowFail && result.status !== 0) {
    console.error(`✗ git ${gitArgs.join(' ')} failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
  return result;
}

const branch = valueOf('--branch') ?? git(['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true }).stdout?.trim();
if (!branch || branch === 'HEAD') {
  console.error('✗ Could not resolve current branch (detached HEAD?). Pass --branch <name>.');
  process.exit(1);
}

const targets = only ? VARIANTS.filter((v) => v.pkg === only) : VARIANTS;
if (targets.length === 0) {
  console.error(`✗ Unknown variant "${only}". Known: ${VARIANTS.map((v) => v.pkg).join(', ')}`);
  process.exit(1);
}

const author = ['-c', 'user.name=Mohamed Meabed', '-c', 'user.email=mo@meabed.com'];

console.log(`\n=== Sync ${targets.length} repo(s): branch "${branch}"${dryRun ? ' (dry run)' : ''} ===`);

let failed = false;
for (const variant of targets) {
  console.log(`\n→ ${variant.pkg} (${variant.remote})`);

  if (variant.pkg === CANONICAL) {
    // Canonical repo: normal push with real history.
    if (dryRun) {
      console.log(`  (dry-run) git push ${force ? '--force ' : ''}${variant.remote} ${branch}`);
      continue;
    }
    const pushArgs = ['push', variant.remote, `${branch}:${branch}`, '--tags'];
    if (force) pushArgs.push('--force');
    if (git(pushArgs, { allowFail: true }).status !== 0) failed = true;
    else console.log(`  ✓ pushed ${branch} to ${variant.pkg}.`);
    continue;
  }

  // Follower repo: snapshot the ref, transform names, force-push a fresh commit.
  const dir = mkdtempSync(join(tmpdir(), `${variant.pkg}-`));
  try {
    const tar = join(dir, 'snapshot.tar');
    git(['archive', '--format=tar', '-o', tar, branch]);
    const untar = spawnSync('tar', ['-xf', tar, '-C', dir], { stdio: 'inherit' });
    if (untar.status !== 0) throw new Error('tar extraction failed');
    rmSync(tar);

    await applyVariant(dir, variant);

    if (dryRun) {
      console.log(`  (dry-run) transformed snapshot → git push --force ${variant.remote} HEAD:${branch}`);
      continue;
    }

    git(['init', '-q', '-b', branch], { cwd: dir });
    git(['add', '-A'], { cwd: dir });
    git([...author, 'commit', '-q', '-m', `chore: build ${variant.pkg} from is-record`], { cwd: dir });
    const push = git(['push', '--force', variant.remote, `${branch}:${branch}`], { cwd: dir, allowFail: true });
    if (push.status !== 0) failed = true;
    else console.log(`  ✓ pushed transformed ${variant.pkg} → ${branch}.`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (failed) {
  console.error('\n✗ One or more pushes failed. Check SSH access to the repos above.');
  process.exit(1);
}
console.log(dryRun ? '\n✓ Dry-run complete.' : `\n✓ Synced "${branch}" to ${targets.map((v) => v.pkg).join(' + ')}.`);
