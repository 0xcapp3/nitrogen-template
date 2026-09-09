/**
 * Shop domain handling for split-domain setups (`SHOP_CUSTOM_DOMAIN`).
 *
 * Lives in its own module rather than in `shopify.server.ts` because that file
 * calls `shopifyApp()` at import time, which makes it unimportable from a test
 * without a full environment. Keeping this pure keeps it testable.
 */

/**
 * Escapes a literal string for safe interpolation into a `RegExp` source.
 * The custom domain comes from an environment variable, and its dots must match
 * dots — not "any character".
 */
export function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * `customShopDomains` was removed in @shopify/shopify-app-react-router v1.2.0
 * and replaced by `domainTransformations`. For the validation-only case — the
 * domain should be *accepted* as a shop domain, but not rewritten to another
 * host — upstream documents an identity transformation, which is what this
 * builds: `<shop>.<custom-domain>` maps to itself.
 *
 * The shape of `match` is not free-form. `@shopify/shopify-api` derives the
 * list of allowed domains from the regex *source* with
 * `getTransformationDomains()`, which looks for `/\\\.([\\.\w-]+)\$?$/` — an
 * escaped dot followed by the domain, at the end of the pattern. It also reads
 * the target domain out of `transform` via `/\$\d+\.([.\w-]+)$/`. Deviating
 * from this shape does not throw; the domain is silently dropped from the
 * allow-list and the shop stops validating. The tests pin this down.
 *
 * @param customShopDomain Value of `SHOP_CUSTOM_DOMAIN`, if set.
 * @returns Transformations to pass to `shopifyApp`, or `undefined` when no
 *   custom domain is configured.
 */
export function buildDomainTransformations(
  customShopDomain: string | undefined,
): { match: RegExp; transform: string }[] | undefined {
  if (!customShopDomain) {
    return undefined;
  }

  return [
    {
      match: new RegExp(
        `^([a-zA-Z0-9][a-zA-Z0-9-_]*)\\.${escapeForRegExp(customShopDomain)}$`,
      ),
      transform: `$1.${customShopDomain}`,
    },
  ];
}
