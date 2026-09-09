import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { DrizzleSessionStorage } from "./db/session.storage";
import { buildDomainTransformations } from "./shopify.domains";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.April26,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new DrizzleSessionStorage(),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  // See `./shopify.domains` for why this is a `domainTransformations` identity
  // mapping rather than the `customShopDomains` option this template used to
  // pass.
  //
  // Heads up: `shopifyApp` is declared as
  // `shopifyApp<Config extends AppConfigArg>(appConfig: Readonly<Config>)`, so
  // `Config` is inferred from this very object and TypeScript performs NO
  // excess-property checking on it. That is how the old `customShopDomains` key
  // survived its own removal from the library without a single compiler error.
  // Any option renamed or dropped upstream will fail silently here too --
  // re-read the changelog on every @shopify/shopify-app-react-router bump.
  domainTransformations: buildDomainTransformations(
    process.env.SHOP_CUSTOM_DOMAIN,
  ),
});

export default shopify;
export const apiVersion = ApiVersion.April26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
