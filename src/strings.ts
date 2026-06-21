/**
 * String refinements and common format validators. Validators narrow to
 * `string` (a value passing them is, at minimum, a string of that shape).
 *
 * The validators are pragmatic, not RFC-exhaustive — good for guarding
 * tool inputs and API payloads, not for security-critical parsing.
 */

/** Narrows to a non-empty `string` (length > 0). */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** Narrows to an empty `string` (`''`). */
export function isEmptyString(value: unknown): value is string {
  return value === '';
}

/** Narrows to a `string` that is empty or only whitespace. */
export function isBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length === 0;
}

/** Narrows to a `string` that parses as a finite number (e.g. `'42'`, `'-1.5'`). */
export function isNumericString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));
}

/** Narrows to a `string` that is valid JSON (parses without throwing). */
export function isJsonString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Narrows to a `string` shaped like an RFC 4122 UUID (any version, case-insensitive). */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Narrows to a `string` shaped like an email address. Pragmatic, not RFC 5322. */
export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_RE.test(value);
}

/**
 * Narrows to a `string` that parses as a URL via the universal `URL`
 * constructor. Returns `false` where `URL` is unavailable.
 */
export function isUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value === '') return false;
  const URLCtor = (globalThis as { URL?: new (url: string) => unknown }).URL;
  if (!URLCtor) return false;
  try {
    new URLCtor(value);
    return true;
  } catch {
    return false;
  }
}

const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Narrows to a non-empty `string` of valid standard Base64. */
export function isBase64(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length % 4 === 0 && BASE64_RE.test(value);
}
