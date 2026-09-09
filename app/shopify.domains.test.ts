// `shopifyApi` refuses to initialise without a runtime adapter, the same way
// `app/shopify.server.ts` imports one before calling `shopifyApp`.
import "@shopify/shopify-api/adapters/node";
import { describe, expect, it } from "vitest";
import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

import { buildDomainTransformations, escapeForRegExp } from "./shopify.domains";

const CUSTOM_DOMAIN = "custom.domain.com";

/**
 * Builds a real `@shopify/shopify-api` instance so the transformations are
 * judged by the library that actually consumes them, not by our reading of it.
 *
 * This is the point of the whole file: the previous `customShopDomains` option
 * had been removed from the library, yet kept type-checking and silently did
 * nothing. Only exercising `sanitizeShop`/`sanitizeHost` catches that class of
 * failure.
 */
function apiWithCustomDomain(customShopDomain: string | undefined) {
  return shopifyApi({
    apiKey: "test-api-key",
    apiSecretKey: "test-api-secret",
    apiVersion: ApiVersion.April26,
    scopes: ["write_products"],
    hostName: "example.test",
    isEmbeddedApp: true,
    domainTransformations: buildDomainTransformations(customShopDomain),
  });
}

const encodeHost = (host: string) => Buffer.from(host).toString("base64");

describe("escapeForRegExp", () => {
  it("escapes dots so they cannot match arbitrary characters", () => {
    const source = escapeForRegExp("custom.domain.com");

    expect(new RegExp(`^${source}$`).test("custom.domain.com")).toBe(true);
    expect(new RegExp(`^${source}$`).test("customXdomainYcom")).toBe(false);
  });

  it("escapes the other regex metacharacters", () => {
    expect(escapeForRegExp("a+b*c?d")).toBe("a\\+b\\*c\\?d");
  });
});

describe("buildDomainTransformations", () => {
  it("returns undefined when no custom domain is configured", () => {
    expect(buildDomainTransformations(undefined)).toBeUndefined();
    expect(buildDomainTransformations("")).toBeUndefined();
  });

  it("maps a shop on the custom domain to itself", () => {
    const [transformation] = buildDomainTransformations(CUSTOM_DOMAIN)!;
    const matches = `shop1.${CUSTOM_DOMAIN}`.match(transformation.match)!;

    expect(matches).not.toBeNull();
    expect(transformation.transform.replace("$1", matches[1])).toBe(
      `shop1.${CUSTOM_DOMAIN}`,
    );
  });
});

describe("shop validation with SHOP_CUSTOM_DOMAIN set", () => {
  const api = apiWithCustomDomain(CUSTOM_DOMAIN);

  it("accepts a shop on the custom domain", () => {
    expect(api.utils.sanitizeShop(`shop1.${CUSTOM_DOMAIN}`)).toBe(
      `shop1.${CUSTOM_DOMAIN}`,
    );
  });

  it("still accepts regular myshopify.com shops", () => {
    expect(api.utils.sanitizeShop("shop1.myshopify.com")).toBe(
      "shop1.myshopify.com",
    );
  });

  it("rejects an unrelated domain", () => {
    expect(api.utils.sanitizeShop("shop1.evil.com")).toBeNull();
  });

  it("rejects a domain that merely contains the custom domain", () => {
    expect(api.utils.sanitizeShop(`shop1.${CUSTOM_DOMAIN}.evil.com`)).toBeNull();
  });

  it("accepts a host on the custom domain", () => {
    const host = encodeHost(`shop1.${CUSTOM_DOMAIN}`);

    expect(api.utils.sanitizeHost(host)).toBe(host);
  });
});

describe("shop validation without SHOP_CUSTOM_DOMAIN", () => {
  const api = apiWithCustomDomain(undefined);

  it("rejects the custom domain, proving the transformation is what allows it", () => {
    expect(api.utils.sanitizeShop(`shop1.${CUSTOM_DOMAIN}`)).toBeNull();
  });

  it("still accepts regular myshopify.com shops", () => {
    expect(api.utils.sanitizeShop("shop1.myshopify.com")).toBe(
      "shop1.myshopify.com",
    );
  });
});
