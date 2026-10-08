import type { DomainTransformation } from "@shopify/shopify-api";

export function customDomainTransformations(
  domain: string | undefined,
): DomainTransformation[] | undefined {
  if (!domain) return undefined;

  const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return [
    {
      match: new RegExp(`^([a-zA-Z0-9][a-zA-Z0-9-_]*)\\.${escapedDomain}$`),
      transform: "$0",
    },
  ];
}
