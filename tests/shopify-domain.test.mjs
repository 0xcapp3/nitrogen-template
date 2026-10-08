import "@shopify/shopify-api/adapters/node";
import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiVersion, shopifyApi } from "@shopify/shopify-api";
import { customDomainTransformations } from "../app/shopify-domain.server.ts";

function sanitizeShop(domain) {
  const shopify = shopifyApi({
    apiKey: "test-api-key",
    apiSecretKey: "test-api-secret",
    apiVersion: ApiVersion.October25,
    hostName: "app.example.com",
    isEmbeddedApp: true,
    domainTransformations: customDomainTransformations(domain),
    logger: { log: () => {} },
  });

  return shopify.utils.sanitizeShop;
}

test("standard Shopify shops remain valid without a custom domain", () => {
  for (const domain of [undefined, ""]) {
    const sanitize = sanitizeShop(domain);
    assert.equal(
      sanitize("test-shop.myshopify.com"),
      "test-shop.myshopify.com",
    );
    assert.equal(sanitize("test-shop.example.com"), null);
  }
});

test("custom-domain shops keep their hostname and standard shops remain valid", () => {
  const sanitize = sanitizeShop("my.shop.dev");
  assert.equal(sanitize("test-shop.my.shop.dev"), "test-shop.my.shop.dev");
  assert.equal(sanitize("test-shop.myshopify.com"), "test-shop.myshopify.com");
  assert.equal(sanitize("test-shop.my.shop.dev/"), "test-shop.my.shop.dev/");
});

test("custom domain matching rejects similar or unrelated hostnames", () => {
  const sanitize = sanitizeShop("internal.example.com");
  assert.equal(
    sanitize("test-shop.internal.example.com"),
    "test-shop.internal.example.com",
  );
  for (const shop of [
    "test-shop.internalXexample.com",
    "test-shop.internal.example.com.evil.com",
    "test-shop.evilinternal.example.com",
    "test-shop.example.com",
  ]) {
    assert.equal(sanitize(shop), null);
  }
});
