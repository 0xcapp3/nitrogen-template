/**
 * Application-level encryption at rest for Shopify token fields.
 *
 * - AES-256-GCM with a random 12-byte IV per value.
 * - Key source: SHOPIFY_TOKEN_ENCRYPTION_KEY (32 bytes, base64 or hex).
 * - Stored format: enc:v1:<iv_b64>:<tag_b64>:<ciphertext_b64>
 * - Key missing in production: fail closed.
 * - Key missing in dev/test: pass through for local DX.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";
const KEY_BYTES = 32;
const IV_BYTES = 12;

let cachedKey: Buffer | null | undefined;
let warnedMissingKey = false;

function loadKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;

  const raw = process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[token-crypto] SHOPIFY_TOKEN_ENCRYPTION_KEY is required in production. " +
          "Generate one with: openssl rand -base64 32",
      );
    }

    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        "[token-crypto] SHOPIFY_TOKEN_ENCRYPTION_KEY is not set; " +
          "Shopify tokens will be stored in plaintext (dev/test only).",
      );
    }

    cachedKey = null;
    return cachedKey;
  }

  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");

  if (key.length !== KEY_BYTES) {
    throw new Error(
      `[token-crypto] SHOPIFY_TOKEN_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes ` +
        `(got ${key.length}). Generate one with: openssl rand -base64 32`,
    );
  }

  cachedKey = key;
  return cachedKey;
}

export function encryptToken(plain: string | null): string | null {
  if (plain === null || plain === "") return plain;
  if (plain.startsWith(PREFIX)) return plain;

  const key = loadKey();
  if (!key) return plain;

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptToken(stored: string | null): string | null {
  if (stored === null || stored === "") return stored;
  if (!stored.startsWith(PREFIX)) return stored;

  const key = loadKey();
  if (!key) {
    throw new Error(
      "[token-crypto] Found encrypted token data but SHOPIFY_TOKEN_ENCRYPTION_KEY is not set.",
    );
  }

  const parts = stored.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    throw new Error("[token-crypto] Malformed encrypted token value.");
  }

  const [ivB64, tagB64, ciphertextB64] = parts;

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error(
      "[token-crypto] Failed to decrypt Shopify token (wrong or rotated key?).",
    );
  }
}
