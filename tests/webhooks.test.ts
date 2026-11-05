import assert from "node:assert/strict";
import test from "node:test";
import { createWebhookRelay } from "../app/services/webhooks.server";

const token = "a".repeat(64);
const topics: string[] = [
  "customers/data_request",
  "customers/redact",
  "shop/redact",
  "app/uninstalled",
  "app_subscriptions/update",
];
function webhook(
  topic = "shop/redact",
  body = '{ "shop_domain": "example.myshopify.com" }',
) {
  return new Request("https://app.example/webhooks/privacy", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "x-shopify-topic": topic,
      "x-shopify-shop-domain": "example.myshopify.com",
      "x-shopify-webhook-id": "test-id",
      "x-shopify-triggered-at": "2026-09-08T10:00:00Z",
      "x-shopify-hmac-sha256": "original-hmac",
      authorization: "Bearer browser-token",
      cookie: "session=private",
    },
  });
}
test("every route forwards unchanged bytes and allowlisted headers without a Shopify session or secret", async () => {
  for (const topic of topics) {
    const request: ReturnType<typeof webhook> = webhook(topic);
    const original: string = await request.clone().text();
    const relay: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
      applicationKey: "example",
      origin: "https://platform.example/api/v1",
      token,
      transport: async (url, init) => {
        assert.equal(
          url,
          "https://platform.example/api/v1/shopify/apps/example/webhooks",
        );
        assert.equal(
          Buffer.from(init!.body as ArrayBuffer).toString(),
          original,
        );
        const headers: Headers = new Headers(init!.headers);
        assert.equal(headers.get("x-internal-token"), null);
        assert.equal(headers.get("x-shopify-hmac-sha256"), "original-hmac");
        assert.equal(headers.get("x-shopify-topic"), topic);
        assert.equal(headers.get("authorization"), `Bearer ${token}`);
        assert.equal(headers.get("cookie"), null);
        assert.equal(init!.redirect, "error");
        return new Response(null, { status: 204 });
      },
    });
    assert.equal((await relay(request, [topic])).status, 204);
  }
});
test("only durable 204 is success; provider bodies and credentials never escape", async () => {
  for (const status of [200, 202, 400, 401, 403, 413, 415, 429, 500]) {
    const relay: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
      applicationKey: "example",
      origin: "https://platform.example/api/v1",
      token,
      transport: async () => new Response(token, { status }),
    });
    const result: Awaited<ReturnType<typeof relay>> = await relay(
      webhook(),
      topics,
    );
    assert.equal(
      result.status,
      [400, 401, 403, 413, 415].includes(status) ? status : 503,
    );
    assert.ok(!(await result.text()).includes(token));
  }
});
test("rejects wrong topics, missing headers, methods and oversized bodies before forwarding", async () => {
  let calls: number = 0;
  const relay: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
    applicationKey: "example",
    origin: "https://platform.example/api/v1",
    token,
    transport: async () => {
      calls++;
      return new Response(null, { status: 204 });
    },
  });

  assert.equal(
    (await relay(webhook("app/uninstalled"), ["shop/redact"])).status,
    400,
  );
  const missing: ReturnType<typeof webhook> = webhook();
  missing.headers.delete("x-shopify-hmac-sha256");

  assert.equal((await relay(missing, topics)).status, 400);
  const malformed: ReturnType<typeof webhook> = webhook();
  malformed.headers.set("x-shopify-triggered-at", "first,second");

  assert.equal((await relay(malformed, topics)).status, 400);
  assert.equal(
    (await relay(new Request("https://app.example"), topics)).status,
    405,
  );
  assert.equal(
    (await relay(webhook("shop/redact", "x".repeat(1048577)), topics)).status,
    413,
  );
  assert.equal(calls, 0);
});
test("timeout aborts without retry; network failures are safely retryable", async () => {
  let calls: number = 0;
  const relay: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
    applicationKey: "example",
    origin: "https://platform.example/api/v1",
    token,
    timeoutMs: 10,
    transport: async (_url, init) => {
      calls++;
      return new Promise((_resolve, reject) => {
        init!.signal!.addEventListener(
          "abort",
          () => reject(new Error(token)),
          { once: true },
        );
      });
    },
  });

  assert.equal((await relay(webhook(), topics)).status, 503);
  assert.equal(calls, 1);
});
test("rejects unsafe destinations, missing token and redirects; loopback requires explicit dev opt-in", async () => {
  for (const origin of [
    "http://remote.example",
    "https://user:password@platform.example",
    "https://platform.example/path",
    "http://127.0.0.1:8080",
  ]) {
    const relay: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
      applicationKey: "example",
      origin,
      token,
      transport: async () => {
        throw new Error("must not forward");
      },
    });
    assert.equal((await relay(webhook(), topics)).status, 503);
  }
  const missing: ReturnType<typeof createWebhookRelay> = createWebhookRelay({
    applicationKey: "example",
    origin: "https://platform.example/api/v1",
    token: "",
  });

  assert.equal((await missing(webhook(), topics)).status, 503);
});
