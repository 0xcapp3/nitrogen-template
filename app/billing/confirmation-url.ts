/**
 * Accepts only a Shopify charge approval page for the given shop: https, default port,
 * no credentials, host admin.shopify.com (path under /store/{handle}/) or the shop domain.
 * Used before opening the URL top-level; never pass a URL from any other source.
 */
export function isShopifyConfirmationUrl(
  value: unknown,
  shop: string,
): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  if (url.port !== "" && url.port !== "443") return false;
  const handle = shop.slice(0, -".myshopify.com".length);
  if (url.hostname === "admin.shopify.com") {
    return url.pathname.startsWith(`/store/${handle}/`);
  }
  return url.hostname === shop;
}

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,128}$/;

export function isIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && IDEMPOTENCY_KEY.test(value);
}
