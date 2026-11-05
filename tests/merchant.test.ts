import assert from "node:assert/strict";
import test from "node:test";
import { merchantHandler } from "../app/platform/merchant.server";
import { isShopifyConfirmationUrl } from "../app/billing/confirmation-url";
const token = `e30.${Buffer.from(JSON.stringify({ dest: "https://example.myshopify.com" })).toString("base64url")}.signature`;
const storeId = "00000000-0000-4000-8000-000000000001";
const installation = {
  schemaVersion: 1,
  status: "active",
  storeId,
  installationId: "00000000-0000-4000-8000-000000000002",
  activatedAt: "2026-11-05T00:00:00Z",
};
function response(value: unknown) {
  return Response.json(value, {
    headers: { "cache-control": "no-store", "x-correlation-id": "test" },
  });
}
function request(
  operation: string,
  body = "{}",
  headers: Record<string, string> = {},
) {
  return new Request(`https://app.example/api/platform/${operation}`, {
    method: "POST",
    body,
    headers: {
      origin: "https://app.example",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...headers,
    },
  });
}
function handler(transport: typeof fetch) {
  return merchantHandler({
    origin: () => "https://app.example",
    baseUrl: () => "https://platform.example/api/v1",
    applicationKey: () => "example",
    serviceToken: async () => "a".repeat(64),
    fetch: transport,
  });
}
test("installation is verified upstream before exposing the shop, with separated credentials", async () => {
  const result = await handler(async (url, init) => {
    assert.equal(
      url,
      "https://platform.example/api/v1/shopify/apps/example/installations:ensure",
    );
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), `Bearer ${"a".repeat(64)}`);
    assert.equal(headers.get("x-shopify-id-token"), token);
    assert.equal(headers.get("cookie"), null);
    return response(installation);
  })(request("installation"), "installation");
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), {
    installation,
    shop: "example.myshopify.com",
  });
  assert.equal(result.headers.get("cache-control"), "no-store");
});
test("rejects cross-origin, unknown inputs and missing command keys before transport", async () => {
  let calls = 0;
  const handle = handler(async () => {
    calls++;
    return response(installation);
  });
  for (const [operation, body, headers, status] of [
    ["installation", "{}", { origin: "https://evil.example" }, 403],
    ["installation", "{}", { authorization: "" }, 401],
    ["installation", '{"storeId":"other"}', {}, 400],
    ["subscribe", '{"planHandle":"basic"}', {}, 400],
    ["cancel", "{}", {}, 400],
    ["unknown", "{}", {}, 404],
    ["installation", '{"x":1,"x":2}', {}, 400],
  ] as const)
    assert.equal(
      (await handle(request(operation, body, headers), operation)).status,
      status,
    );
  assert.equal(calls, 0);
});
test("billing command targets only the verified store and preserves idempotency without retries", async () => {
  const urls: string[] = [];
  const key = "request_key_123456";
  const handle = handler(async (url, init) => {
    urls.push(String(url));
    if (urls.length === 1) return response(installation);
    assert.equal(new Headers(init?.headers).get("idempotency-key"), key);
    assert.deepEqual(JSON.parse(String(init?.body)), { planHandle: "basic" });
    throw new Error("secret upstream failure");
  });
  const result = await handle(
    request("subscribe", '{"planHandle":"basic"}', { "idempotency-key": key }),
    "subscribe",
  );
  assert.equal(result.status, 502);
  assert.equal(urls.length, 2);
  assert.equal(
    urls[1],
    `https://platform.example/api/v1/billing/apps/example/stores/${storeId}/subscription:subscribe`,
  );
  assert.ok(!(await result.text()).includes("secret"));
});
test("invalid provider schema cannot become a merchant context", async () => {
  const result = await handler(async () =>
    response({ ...installation, storeId: "bad" }),
  )(request("installation"), "installation");
  assert.equal(result.status, 502);
});
test("confirmation URLs cannot leave the verified Shopify shop", () => {
  assert.equal(
    isShopifyConfirmationUrl(
      "https://evil.example/charges/1",
      "example.myshopify.com",
    ),
    false,
  );
  assert.equal(
    isShopifyConfirmationUrl(
      "https://other.myshopify.com/admin/charges/1",
      "example.myshopify.com",
    ),
    false,
  );
});

test("additional receipt fields are compatible but credentials cannot reach the browser", async () => {
  for (const [extra, status] of [
    [{ futureCapability: true }, 200],
    [{ accessToken: "private" }, 502],
  ] as const) {
    const result = await handler(async () =>
      response({ ...installation, ...extra }),
    )(request("installation"), "installation");
    assert.equal(result.status, status);
    assert.ok(!(await result.text()).includes("private"));
  }
});
