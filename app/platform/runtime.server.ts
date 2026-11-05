import { loadServiceToken } from "./service-token.server";
export const serviceToken = loadServiceToken(
  process.env.NITROGEN_PLATFORM_SERVICE_TOKEN,
);
export const runtime = {
  origin: () => new URL(process.env.SHOPIFY_APP_URL || "invalid:").origin,
  baseUrl: () => process.env.NITROGEN_PLATFORM_API_URL || "",
  applicationKey: () => process.env.NITROGEN_PLATFORM_APPLICATION_KEY || "",
  serviceToken,
  allowLocalHttp: process.env.NODE_ENV === "development",
};
