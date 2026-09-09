import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

type TokenCrypto = typeof import("./token-crypto.server");

const KEY_A = randomBytes(32).toString("base64");
const KEY_B = randomBytes(32).toString("base64");
const KEY_HEX = randomBytes(32).toString("hex");

/**
 * `token-crypto.server` caches the key and the "missing key" warning in module
 * scope, so a single import can only ever exercise one key configuration.
 * Resetting the module registry and re-importing gives each scenario a clean
 * slate, without adding a test-only reset hook to production code.
 */
async function loadWith(env: {
  key?: string;
  nodeEnv?: string;
}): Promise<TokenCrypto> {
  vi.resetModules();

  if (env.key === undefined) {
    delete process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
  } else {
    process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY = env.key;
  }
  vi.stubEnv("NODE_ENV", env.nodeEnv ?? "test");

  return import("./token-crypto.server");
}

afterEach(() => {
  vi.unstubAllEnvs();
  delete process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
});

describe("with a key configured", () => {
  it("round-trips a token", async () => {
    const { encryptToken, decryptToken } = await loadWith({ key: KEY_A });
    const stored = encryptToken("shpat_secret");

    expect(stored).not.toBe("shpat_secret");
    expect(stored).toMatch(/^enc:v1:/);
    expect(decryptToken(stored)).toBe("shpat_secret");
  });

  it("accepts a hex-encoded key as well as base64", async () => {
    const { encryptToken, decryptToken } = await loadWith({ key: KEY_HEX });

    expect(decryptToken(encryptToken("shpat_secret"))).toBe("shpat_secret");
  });

  it("produces a different ciphertext each time, thanks to the random IV", async () => {
    const { encryptToken } = await loadWith({ key: KEY_A });

    expect(encryptToken("shpat_secret")).not.toBe(encryptToken("shpat_secret"));
  });

  it("does not re-encrypt a value that is already encrypted", async () => {
    const { encryptToken } = await loadWith({ key: KEY_A });
    const once = encryptToken("shpat_secret");

    expect(encryptToken(once)).toBe(once);
  });

  it("passes null and empty string straight through", async () => {
    const { encryptToken, decryptToken } = await loadWith({ key: KEY_A });

    expect(encryptToken(null)).toBeNull();
    expect(encryptToken("")).toBe("");
    expect(decryptToken(null)).toBeNull();
    expect(decryptToken("")).toBe("");
  });

  it("returns unprefixed values untouched, so pre-encryption rows still read", async () => {
    const { decryptToken } = await loadWith({ key: KEY_A });

    expect(decryptToken("shpat_plaintext_legacy")).toBe(
      "shpat_plaintext_legacy",
    );
  });

  it("rejects a malformed encrypted value", async () => {
    const { decryptToken } = await loadWith({ key: KEY_A });

    expect(() => decryptToken("enc:v1:only-one-part")).toThrow(
      /Malformed encrypted token/,
    );
  });

  it("rejects a value encrypted under a rotated key", async () => {
    const { encryptToken } = await loadWith({ key: KEY_A });
    const stored = encryptToken("shpat_secret");

    const { decryptToken } = await loadWith({ key: KEY_B });

    expect(() => decryptToken(stored)).toThrow(/Failed to decrypt/);
  });

  it("rejects a tampered ciphertext, because GCM authenticates it", async () => {
    const { encryptToken, decryptToken } = await loadWith({ key: KEY_A });
    const [prefix, version, iv, tag, ciphertext] = encryptToken(
      "shpat_secret",
    )!.split(":");
    const flipped = Buffer.from(ciphertext, "base64");
    flipped[0] ^= 0xff;

    expect(() =>
      decryptToken(
        [prefix, version, iv, tag, flipped.toString("base64")].join(":"),
      ),
    ).toThrow(/Failed to decrypt/);
  });
});

describe("with an invalid key", () => {
  it("refuses a key that does not decode to 32 bytes", async () => {
    const short = randomBytes(16).toString("base64");
    const { encryptToken } = await loadWith({ key: short });

    expect(() => encryptToken("shpat_secret")).toThrow(/must decode to 32 bytes/);
  });
});

describe("without a key", () => {
  it("stores plaintext in development, for local DX", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { encryptToken } = await loadWith({ nodeEnv: "development" });

    expect(encryptToken("shpat_secret")).toBe("shpat_secret");
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it("warns only once, however many tokens are encrypted", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { encryptToken } = await loadWith({ nodeEnv: "development" });

    encryptToken("a");
    encryptToken("b");
    encryptToken("c");

    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it("fails closed in production", async () => {
    const { encryptToken } = await loadWith({ nodeEnv: "production" });

    expect(() => encryptToken("shpat_secret")).toThrow(
      /required in production/,
    );
  });

  it("refuses to read back data that was encrypted, instead of silently corrupting it", async () => {
    const { encryptToken } = await loadWith({ key: KEY_A });
    const stored = encryptToken("shpat_secret");

    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { decryptToken } = await loadWith({ nodeEnv: "development" });

    expect(() => decryptToken(stored)).toThrow(
      /Found encrypted token data but SHOPIFY_TOKEN_ENCRYPTION_KEY is not set/,
    );

    vi.restoreAllMocks();
  });
});
