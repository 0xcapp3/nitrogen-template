import assert from "node:assert/strict";
import test from "node:test";
import { loadServiceToken } from "../app/platform/service-token.server";
import { PlatformApiError } from "../app/platform/client";

test("credential is captured from the environment at startup", async () => {
  const before = process.env.NITROGEN_PLATFORM_SERVICE_TOKEN;
  try {
    process.env.NITROGEN_PLATFORM_SERVICE_TOKEN = "a".repeat(64);
    const current = loadServiceToken(
      process.env.NITROGEN_PLATFORM_SERVICE_TOKEN,
    );
    process.env.NITROGEN_PLATFORM_SERVICE_TOKEN = "b".repeat(64);
    const restarted = loadServiceToken(
      process.env.NITROGEN_PLATFORM_SERVICE_TOKEN,
    );
    assert.equal(await current(), "a".repeat(64));
    assert.equal(await restarted(), "b".repeat(64));
    delete process.env.NITROGEN_PLATFORM_SERVICE_TOKEN;
    assert.equal(await current(), "a".repeat(64));
  } finally {
    if (before === undefined)
      delete process.env.NITROGEN_PLATFORM_SERVICE_TOKEN;
    else process.env.NITROGEN_PLATFORM_SERVICE_TOKEN = before;
  }
});

test("missing or malformed environment credentials fail closed without exposing material", async () => {
  const safe = (error: unknown) =>
    error instanceof PlatformApiError &&
    error.status === 503 &&
    error.code === "edge_unavailable";
  await assert.rejects(loadServiceToken(undefined)(), safe);
  await assert.rejects(loadServiceToken("")(), safe);
  for (const value of [
    "a".repeat(63),
    "a".repeat(65),
    "g".repeat(64),
    "A".repeat(64),
    "a".repeat(64) + "\n",
    "a".repeat(64) + "\r\n",
    " " + "a".repeat(64),
    "/unused/token-file",
    "header.payload.signature",
  ]) {
    assert.throws(
      () => loadServiceToken(value),
      (error: unknown) => {
        assert.ok(safe(error));
        assert.ok(!String(error).includes(value));
        assert.ok(!JSON.stringify(error).includes(value));
        return true;
      },
    );
  }
});
