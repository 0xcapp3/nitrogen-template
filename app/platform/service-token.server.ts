import { PlatformApiError } from "./client";

type ServiceTokenProvider = () => Promise<string>;

/** Captures the environment value at startup; rotation requires restarting the process. */
export function loadServiceToken(
  token: string | undefined,
): ServiceTokenProvider {
  // An unconfigured shell can start, but every Platform capability fails closed.
  if (!token)
    return async () => {
      throw new PlatformApiError(503, "edge_unavailable");
    };
  if (token.length !== 64 || !/^[0-9a-f]{64}$/.test(token))
    throw new PlatformApiError(503, "edge_unavailable");
  return async () => token;
}
