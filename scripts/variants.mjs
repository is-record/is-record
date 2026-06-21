/**
 * The three published packages. The canonical source tree (this repo) is the
 * `is-record` variant; the others are produced by a deterministic name
 * transform and force-pushed to their own repos, so each repo is a clean,
 * self-consistent standalone package (own name, URLs, docs) that publishes its
 * own npm name from its own CI.
 *
 * The transform is intentionally trivial — replace the repo path, then the bare
 * slug. The public API (`isRecord`, camelCase) is never matched by the
 * lowercase-hyphen slug `is-record`, so it stays put.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Canonical package slug used as the replacement source in the base tree. */
export const CANONICAL = 'is-record';

export const VARIANTS = [
  { pkg: 'is-record', repo: 'is-record/is-record', remote: 'git@github.com:is-record/is-record.git' },
  { pkg: 'isrecord', repo: 'isrecord/isrecord', remote: 'git@github.com:isrecord/isrecord.git' },
  { pkg: 'isguard', repo: 'isguard/isguard', remote: 'git@github.com:isguard/isguard.git' },
];

/**
 * Files rewritten per variant — those that carry the package's own identity
 * (name, URLs, install/usage docs). `AGENTS.md` is deliberately excluded: it's
 * shared contributor docs describing the whole multi-repo system and stays
 * identical (referencing `is-record` as canonical) in every repo.
 */
export const TRANSFORM_FILES = ['package.json', 'README.md', 'CHANGELOG.md', '.github/workflows/release.yml'];

/** Rewrite a single text blob from the canonical slug/repo to `variant`. */
export function transformText(text, variant) {
  return text.split(`${CANONICAL}/${CANONICAL}`).join(variant.repo).split(CANONICAL).join(variant.pkg);
}

/** Apply {@link transformText} in place across {@link TRANSFORM_FILES} inside `dir`. */
export async function applyVariant(dir, variant) {
  if (variant.pkg === CANONICAL) return; // canonical tree is already correct
  for (const rel of TRANSFORM_FILES) {
    const path = join(dir, rel);
    const original = await readFile(path, 'utf8').catch(() => null);
    if (original === null) continue;
    const next = transformText(original, variant);
    if (next !== original) await writeFile(path, next);
  }
}
