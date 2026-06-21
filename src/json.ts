/**
 * JSON value model + guards. These verify a value is composed solely of
 * JSON-safe data (recursively) — useful before `JSON.stringify`, or to validate
 * decoded payloads.
 */

import { isPlainObject } from './objects';

/** A JSON primitive: `string | number | boolean | null`. */
export type JsonPrimitive = string | number | boolean | null;

/** Any JSON-serialisable value. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** A JSON object (string keys → JSON values). */
export interface JsonObject {
  [key: string]: JsonValue;
}

/** A JSON array of JSON values. */
export type JsonArray = JsonValue[];

/** Narrows to a {@link JsonPrimitive}. Numbers must be finite (JSON has no `NaN`/`Infinity`). */
export function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

/** Narrows to a {@link JsonArray} — an array whose every element is a JSON value. */
export function isJsonArray(value: unknown): value is JsonArray {
  return Array.isArray(value) && value.every((item) => isJsonValue(item));
}

/** Narrows to a {@link JsonObject} — a plain object whose every value is a JSON value. */
export function isJsonObject(value: unknown): value is JsonObject {
  return isPlainObject(value) && Object.values(value).every((item) => isJsonValue(item));
}

/** Narrows to any {@link JsonValue} (primitive, array, or object — recursively JSON-safe). */
export function isJsonValue(value: unknown): value is JsonValue {
  return isJsonPrimitive(value) || isJsonArray(value) || isJsonObject(value);
}
