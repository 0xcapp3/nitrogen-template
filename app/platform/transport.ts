import { isLosslessNumber, parse, stringify } from "lossless-json";

/** JSON Pointer paths from the contract; '*' matches one array/object segment. */
export type Int64Fields = readonly string[];
const MIN_INT64 = -(1n << 63n);
const MAX_INT64 = (1n << 63n) - 1n;
const INTEGER = /^-?(?:0|[1-9][0-9]*)$/;

function int64At(fields: Int64Fields, path: readonly string[]): boolean {
  return fields.some((field) => {
    const segments = field
      .split("/")
      .slice(1)
      .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
    return (
      segments.length === path.length &&
      segments.every(
        (segment, index) => segment === "*" || segment === path[index],
      )
    );
  });
}

function walk(
  value: unknown,
  fields: Int64Fields,
  path: string[],
  decoding: boolean,
): unknown {
  if (int64At(fields, path) && value !== null) {
    let integer: bigint;
    if (decoding) {
      if (!isLosslessNumber(value) || !INTEGER.test(value.value))
        throw new TypeError("Expected an int64 JSON number");
      integer = BigInt(value.value);
    } else {
      if (typeof value !== "bigint")
        throw new TypeError("Expected an int64 bigint");
      integer = value;
    }
    if (integer < MIN_INT64 || integer > MAX_INT64)
      throw new RangeError("int64 overflow");
    return integer;
  }
  if (isLosslessNumber(value)) {
    const numeric = value.valueOf();
    if (
      typeof numeric !== "number" ||
      !Number.isFinite(numeric) ||
      (Number.isInteger(numeric) && !Number.isSafeInteger(numeric))
    )
      throw new RangeError("Undeclared unsafe JSON number");
    return numeric;
  }
  if (typeof value === "bigint") throw new TypeError("Undeclared int64 field");
  if (
    typeof value === "number" &&
    (!Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value)))
  )
    throw new RangeError("Unsafe JSON number");
  if (Array.isArray(value))
    return value.map((item, index) =>
      walk(item, fields, [...path, String(index)], decoding),
    );
  if (value !== null && typeof value === "object") {
    if (
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    )
      throw new TypeError("Expected a JSON object");
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        walk(item, fields, [...path, key], decoding),
      ]),
    );
  }
  if (
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol"
  )
    throw new TypeError("Expected a JSON value");
  return value;
}

/** Parse before validating; int64 fields never pass through JavaScript Number. */
export function decodeWireJson(
  text: string,
  fields: Int64Fields = [],
): unknown {
  return walk(parse(text), fields, [], true);
}

/** Bigints are emitted as JSON number tokens, never as quoted strings. */
export function encodeWireJson(
  value: unknown,
  fields: Int64Fields = [],
): string {
  const result = stringify(walk(value, fields, [], false));
  if (result === undefined) throw new TypeError("Expected a JSON value");
  return result;
}

/** Runtime-only AJV keyword: the public schema still declares integer/int64. */
export function apiUrl(
  base: string,
  path: string,
  allowLocalHttp = false,
): string {
  const url = new URL(base);
  const local =
    allowLocalHttp &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !local) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/api\/v1\/?$/.test(url.pathname) ||
    !/^\/(mobile|vto|shopify|billing)\//.test(path) ||
    path.includes("#") ||
    path.includes("\\") ||
    path
      .split("?")[0]
      .split("/")
      .some((part) => [".", ".."].includes(decodeURIComponent(part)))
  )
    throw new TypeError("Invalid Platform API URL");
  return url.origin + "/api/v1" + path;
}

export class WireBodyLimitError extends Error {
  constructor() {
    super("Response exceeds limit");
    this.name = "WireBodyLimitError";
  }
}

export async function readWireJson(
  response: Response,
  fields: Int64Fields = [],
  limit = 1048576,
): Promise<unknown> {
  const declared = response.headers.get("content-length");
  if (
    declared !== null &&
    (!/^[0-9]+$/.test(declared) || Number(declared) > limit)
  ) {
    await response.body?.cancel();
    throw new WireBodyLimitError();
  }
  if (!response.body) throw new TypeError("Missing JSON response");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0,
    text = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) throw new WireBodyLimitError();
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    return decodeWireJson(text, fields);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}
