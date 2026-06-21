#!/usr/bin/env bun
/**
 * Release every package at a single explicit version, to npm + GitHub, from one
 * place. Builds once, then for each variant (`is-record`, `isrecord`, `isguard`)
 * publishes a clean, name-transformed tarball to npm and cuts a GitHub release
 * (tag `v<version>`) in that variant's repo.
 *
 * Versions are NOT committed into package.json — semantic-release keeps the repo
 * at `0.0.0-development` and tags are the source of truth. This script stamps the
 * version only into the published tarball + the git tag, matching that model.
 *
 * Usage:
 *   bun run release:all <version> [--dry-run] [--no-npm] [--no-github]
 *
 * Examples:
 *   bun run release:all 0.1.0 --dry-run   # rehearse everything
 *   bun run release:all 0.1.0             # publish all 3 to npm + GitHub
 *
 * Prerequisites: `npm whoami` (npm login) and `gh auth status` (gh auth login),
 * with publish/repo access to all three packages and repos. Pushes to the repos'
 * `develop` must already be in place (`bun run sync`) so the release tag has a
 * target commit.
 */

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformText, VARIANTS } from './variants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const version = args.find((a) => !a.startsWith('--') && a !== process.argv[1]);
const dryRun = args.includes('--dry-run');
const skipNpm = args.includes('--no-npm');
const skipGithub = args.includes('--no-github');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? (args[onlyIdx + 1] ?? '').split(',') : null;
const targets = only ? VARIANTS.filter((v) => only.includes(v.pkg)) : VARIANTS;

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: bun run release:all <semver> [--dry-run] [--no-npm] [--no-github]');
  console.error(`got: ${process.argv.slice(2).join(' ')}`);
  process.exit(1);
}

const prerelease = version.includes('-');
const distTag = prerelease ? 'next' : 'latest';

function run(cmd, runArgs, { allowFail = false } = {}) {
  console.log(`\n→ ${cmd} ${runArgs.join(' ')}`);
  const result = spawnSync(cmd, runArgs, { stdio: 'inherit', cwd: ROOT });
  if (!allowFail && result.status !== 0) {
    console.error(`\n✗ ${cmd} exited with ${result.status}`);
    process.exit(result.status ?? 1);
  }
  return result.status ?? 1;
}

// Preflight auth checks (skipped for dry runs / when a stage is disabled).
if (!dryRun && !skipNpm && spawnSync('npm', ['whoami'], { stdio: 'pipe' }).status !== 0) {
  console.error('✗ `npm whoami` failed — run `npm login` first.');
  process.exit(1);
}
if (!dryRun && !skipGithub && spawnSync('gh', ['auth', 'status'], { stdio: 'pipe' }).status !== 0) {
  console.error('✗ `gh auth status` failed — run `gh auth login` first.');
  process.exit(1);
}

console.log(`\n=== Release all @ ${version}${dryRun ? ' (dry run)' : ''} [tag=${distTag}] ===`);

// Build once — dist is name-agnostic, so every variant ships the same bundle.
run('bun', ['run', 'build']);

// --- npm: publish each variant from a clean staging dir ---
if (!skipNpm) {
  for (const variant of targets) {
    console.log(`\n--- npm publish: ${variant.pkg}@${version} ---`);
    const dir = mkdtempSync(join(tmpdir(), `${variant.pkg}-pub-`));
    try {
      cpSync(join(ROOT, 'dist'), join(dir, 'dist'), { recursive: true });
      cpSync(join(ROOT, 'LICENSE'), join(dir, 'LICENSE'));
      const pkg = JSON.parse(transformText(readFileSync(join(ROOT, 'package.json'), 'utf8'), variant));
      pkg.version = version;
      writeFileSync(join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
      writeFileSync(join(dir, 'README.md'), transformText(readFileSync(join(ROOT, 'README.md'), 'utf8'), variant));
      writeFileSync(join(dir, 'CHANGELOG.md'), transformText(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'), variant));

      // Pre-built dist → ignore lifecycle scripts; provenance is CI-only.
      const pubArgs = ['publish', dir, '--access', 'public', '--provenance=false', '--ignore-scripts', '--tag', distTag];
      if (dryRun) pubArgs.push('--dry-run');
      run('npm', pubArgs);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}

// --- GitHub: cut a release (tag v<version>) per repo on its develop HEAD ---
if (!skipGithub) {
  for (const variant of targets) {
    console.log(`\n--- GitHub release: ${variant.repo} v${version} ---`);
    const notes = `Release \`v${version}\` of [\`${variant.pkg}\`](https://www.npmjs.com/package/${variant.pkg}).\n\n\`\`\`bash\nnpm install ${variant.pkg}@${version}\n\`\`\``;
    const ghArgs = [
      'release',
      'create',
      `v${version}`,
      '--repo',
      variant.repo,
      '--target',
      'develop',
      '--title',
      `v${version}`,
      '--notes',
      notes,
      prerelease ? '--prerelease' : '--latest',
    ];
    if (dryRun) {
      console.log(`  (dry-run) gh ${ghArgs.join(' ')}`);
    } else {
      // allowFail: one repo hiccup shouldn't abort the others.
      run('gh', ghArgs, { allowFail: true });
    }
  }
}

console.log(
  dryRun
    ? '\n✓ Dry-run complete. Re-run without --dry-run to release for real.'
    : `\n✓ Released v${version}: is-record + isrecord + isguard published to npm and tagged on GitHub.`
);
