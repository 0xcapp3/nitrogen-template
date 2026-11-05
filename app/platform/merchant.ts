import {
  PlatformApiError,
  problemError,
} from "../../contracts/platform-api/1.0.0/client";
import {
  encodeWireJson,
  readWireJson,
} from "../../contracts/platform-api/1.0.0/transport";
import { int64Fields, type CurrentSchemas } from "./current-contract";
import { conformsCurrent } from "./current-validation";

type Bridge = { idToken(): Promise<string> };
function bridge(): Bridge {
  return (window as unknown as { shopify: Bridge }).shopify;
}

const pendingReads = new Map<string, Promise<unknown>>();

export function requestValue(
  operation: string,
  method = "GET",
  body?: unknown,
  key?: string,
  paths: readonly string[] = [],
): Promise<unknown> {
  if (method !== "GET" || body !== undefined || key !== undefined)
    return fetchValue(operation, method, body, key, paths);
  const readKey = JSON.stringify([operation, paths]);
  let pending = pendingReads.get(readKey);
  if (!pending) {
    pending = fetchValue(operation, method, body, key, paths).finally(() => {
      pendingReads.delete(readKey);
    });
    pendingReads.set(readKey, pending);
  }
  return pending;
}

async function fetchValue(
  operation: string,
  method: string,
  body?: unknown,
  key?: string,
  paths: readonly string[] = [],
): Promise<unknown> {
  const token = await bridge().idToken();
  const response = await fetch(`/api/platform/${operation}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(key === undefined ? {} : { "Idempotency-Key": key }),
    },
    ...(body === undefined ? {} : { body: encodeWireJson(body, []) }),
  });
  const value = await readWireJson(response, response.ok ? paths : []);
  if (!response.ok) throw problemError(response, value);
  return value;
}

export async function capability<N extends keyof CurrentSchemas>(
  name: N,
  operation: string,
  method = "GET",
  body?: unknown,
  key?: string,
): Promise<CurrentSchemas[N]> {
  const value = await requestValue(
    operation,
    method,
    body,
    key,
    int64Fields[name],
  );
  if (!conformsCurrent(name, value))
    throw new PlatformApiError(502, "edge_invalid_response");
  return value;
}

export type MerchantContext = {
  installation: CurrentSchemas["ShopifyInstallation"];
  shop: string;
};
export async function merchantContext(): Promise<MerchantContext> {
  const value = await requestValue("installation", "POST", {});
  if (
    !value ||
    typeof value !== "object" ||
    !("installation" in value) ||
    !("shop" in value) ||
    !conformsCurrent("ShopifyInstallation", value.installation) ||
    typeof value.shop !== "string" ||
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value.shop)
  )
    throw new PlatformApiError(502, "edge_invalid_response");
  return { installation: value.installation, shop: value.shop };
}
