import type { AppResponses } from "./models";
const object = (v: unknown): v is Record<string, unknown> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  ![
    "accessToken",
    "apiSecret",
    "apiKey",
    "secret",
    "publicAccessToken",
    "token",
  ].some((key) => Object.hasOwn(v, key));
const text = (v: unknown) => typeof v === "string";
const nullableText = (v: unknown) => v === null || text(v);
const number = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const uuid = (v: unknown) =>
  text(v) &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v as string,
  );
const plan = (v: unknown): boolean =>
  object(v) &&
  text(v.planHandle) &&
  text(v.displayName) &&
  typeof v.selfService === "boolean" &&
  text(v.currencyCode) &&
  text(v.interval) &&
  (v.price === null || number(v.price)) &&
  Array.isArray(v.features) &&
  v.features.every(text) &&
  (v.usage === null ||
    (object(v.usage) && text(v.usage.terms) && number(v.usage.defaultCap)));
/** Check the values consumed by the UI; Platform owns full API validation. */
export function validResponse<N extends keyof AppResponses>(
  name: N,
  value: unknown,
): value is AppResponses[N] {
  if (!object(value)) return false;
  switch (name) {
    case "ShopifyInstallation":
      return (
        value.schemaVersion === 1 &&
        value.status === "active" &&
        uuid(value.storeId) &&
        uuid(value.installationId) &&
        text(value.activatedAt)
      );
    case "BillingSubscribe":
      return (
        Object.keys(value).length === 1 &&
        typeof value.planHandle === "string" &&
        /^[a-z0-9_-]{1,64}$/.test(value.planHandle)
      );
    case "BillingCommandResult":
      return text(value.status) && nullableText(value.confirmationUrl);
    case "BillingDetails":
      return (
        text(value.mode) &&
        object(value.access) &&
        text(value.access.mode) &&
        object(value.verification) &&
        text(value.verification.status) &&
        object(value.subscription) &&
        text(value.subscription.status) &&
        nullableText(value.subscription.planHandle) &&
        typeof value.subscription.test === "boolean" &&
        (value.proposal === null ||
          (object(value.proposal) &&
            text(value.proposal.status) &&
            nullableText(value.proposal.planHandle) &&
            nullableText(value.proposal.confirmationUrl))) &&
        object(value.catalog) &&
        Array.isArray(value.catalog.plans) &&
        value.catalog.plans.every(plan) &&
        object(value.usage) &&
        number(value.usage.included) &&
        number(value.usage.remaining) &&
        typeof value.usage.extraCount === "bigint" &&
        number(value.usage.extraAmount) &&
        text(value.usage.currencyCode)
      );
    default:
      return false;
  }
}
