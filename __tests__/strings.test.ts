import { describe, expect, it } from 'bun:test';
import {
  isBase64,
  isBlankString,
  isEmail,
  isEmptyString,
  isJsonString,
  isNonEmptyString,
  isNumericString,
  isUrl,
  isUuid,
} from '../src/index';

describe('string guards', () => {
  it('emptiness flavours', () => {
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('')).toBe(false);
    expect(isEmptyString('')).toBe(true);
    expect(isEmptyString(' ')).toBe(false);
    expect(isBlankString('   ')).toBe(true);
    expect(isBlankString('a')).toBe(false);
  });

  it('isNumericString', () => {
    expect(isNumericString('42')).toBe(true);
    expect(isNumericString('-1.5')).toBe(true);
    expect(isNumericString('  3 ')).toBe(true);
    expect(isNumericString('')).toBe(false);
    expect(isNumericString('abc')).toBe(false);
  });

  it('isJsonString', () => {
    expect(isJsonString('{"a":1}')).toBe(true);
    expect(isJsonString('[1,2]')).toBe(true);
    expect(isJsonString('nope')).toBe(false);
    expect(isJsonString(42)).toBe(false);
  });

  it('isUuid', () => {
    expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isUuid('not-a-uuid')).toBe(false);
  });

  it('isEmail', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('nope')).toBe(false);
  });

  it('isUrl', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('mailto:a@b.co')).toBe(true);
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('')).toBe(false);
  });

  it('isBase64', () => {
    expect(isBase64('aGVsbG8=')).toBe(true);
    expect(isBase64('Zm9vYmE=')).toBe(true);
    expect(isBase64('not base64!!')).toBe(false);
    expect(isBase64('')).toBe(false);
  });
});
