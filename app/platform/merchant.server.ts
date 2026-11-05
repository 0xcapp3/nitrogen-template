import { edgeProblem } from "./problem.server";
import { randomUUID } from "node:crypto";
import {
  PlatformApiClient,
  PlatformApiError,
} from "../../contracts/platform-api/1.0.0/client";
import {
  encodeWireJson,
  readWireJson,
  WireBodyLimitError,
} from "../../contracts/platform-api/1.0.0/transport";
import { int64Fields, type CurrentSchemas } from "./current-contract";
import { conformsCurrent } from "./current-validation";

export function merchantHandler(options: {
  origin: () => string;
  baseUrl: () => string;
  applicationKey: () => string;
  serviceToken: () => Promise<string>;
  fetch?: typeof fetch;
  allowLocalHttp?: boolean;
}) {
  return async (request: Request, operation: string): Promise<Response> => {
    const correlation = randomUUID();
    const headers = {
      "Cache-Control": "no-store",
      "X-Correlation-Id": correlation,
      "X-Content-Type-Options": "nosniff",
      "Content-Type": "application/json",
    };
    try {
      const methods: Record<string, string> = {
        installation: "POST",
        billing: "GET",
        refresh: "POST",
        subscribe: "POST",
        cancel: "POST",
      };
      if (!Object.hasOwn(methods, operation))
        throw new PlatformApiError(404, "not_found");
      if (request.method !== methods[operation]) {
        return edgeProblem(request, 405, "method_not_allowed", {
          Allow: methods[operation],
        });
      }
      const url = new URL(request.url),
        origin = new URL(options.origin()).origin;
      // The local connection may be HTTP behind the HTTPS Shopify tunnel. Validate
      // browser origin against configuration, not the proxy's reconstructed URL.
      if (
        request.headers.get("sec-fetch-site") === "cross-site" ||
        (request.headers.has("origin") &&
          request.headers.get("origin") !== origin) ||
        (request.method !== "GET" && request.headers.get("origin") !== origin)
      )
        throw new PlatformApiError(403, "forbidden");
      if (url.search) throw new PlatformApiError(400, "invalid_request");
      const authorization = request.headers.get("authorization") ?? "";
      if (
        !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
          authorization,
        )
      )
        throw new PlatformApiError(401, "unauthorized");
      const idToken = authorization.slice(7);
      const application = options.applicationKey();
      if (!/^[a-z][a-z0-9-]{0,63}$/.test(application))
        throw new PlatformApiError(503, "edge_unavailable");
      let body: unknown;
      if (request.method !== "GET") {
        if (
          !/^application\/json(?:;|$)/i.test(
            request.headers.get("content-type") ?? "",
          )
        )
          throw new PlatformApiError(415, "unsupported_media_type");
        try {
          body = await readWireJson(new Response(request.body), [], 4096);
        } catch (error) {
          throw new PlatformApiError(
            error instanceof WireBodyLimitError ? 413 : 400,
            error instanceof WireBodyLimitError
              ? "payload_too_large"
              : "invalid_request",
          );
        }
        if (!body || typeof body !== "object" || Array.isArray(body))
          throw new PlatformApiError(400, "invalid_request");
        if (operation === "subscribe") {
          if (!conformsCurrent("BillingSubscribe", body))
            throw new PlatformApiError(422, "validation_failed");
        } else if (Object.keys(body).length)
          throw new PlatformApiError(400, "invalid_request");
      }
      const key = request.headers.get("idempotency-key") ?? undefined;
      if (
        ["subscribe", "cancel"].includes(operation) &&
        (!key || !/^[A-Za-z0-9_-]{16,128}$/.test(key))
      )
        throw new PlatformApiError(400, "invalid_request");
      const client = new PlatformApiClient({
        ...options,
        baseUrl: options.baseUrl(),
      });
      const read = <N extends keyof CurrentSchemas>(
        name: N,
        path: string,
        method: "GET" | "POST" | "PUT" = "GET",
        payload?: unknown,
        query?: Record<string, string>,
      ) =>
        client.request({
          path,
          method,
          idToken,
          body: payload,
          query,
          idempotencyKey: ["subscribe", "cancel"].includes(operation)
            ? key
            : undefined,
          responseInt64: int64Fields[name],
          validate: (value): value is CurrentSchemas[N] =>
            conformsCurrent(name, value),
        });
      const installation = await read(
        "ShopifyInstallation",
        `/shopify/apps/${application}/installations:ensure`,
        "POST",
      );
      const store = installation.storeId;
      const billing = `/billing/apps/${application}/stores/${store}`;
      if (operation === "installation") {
        // Decode only after Platform has verified this exact ID token.
        const claims = JSON.parse(
          Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"),
        ) as { dest: string };
        const shop = new URL(claims.dest).hostname;
        if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop))
          throw new PlatformApiError(502, "edge_invalid_response");
        return Response.json({ installation, shop }, { headers });
      }
      const reply = async <N extends keyof CurrentSchemas>(
        name: N,
        path: string,
        method: "GET" | "POST" | "PUT" = "GET",
        payload?: unknown,
        query?: Record<string, string>,
      ) =>
        new Response(
          encodeWireJson(
            await read(name, path, method, payload, query),
            int64Fields[name],
          ),
          { headers },
        );
      switch (operation) {
        case "billing":
          return await reply("BillingDetails", billing);
        case "refresh":
          return await reply("BillingDetails", billing + ":refresh", "POST");
        case "subscribe":
          return await reply(
            "BillingCommandResult",
            billing + "/subscription:subscribe",
            "POST",
            body,
          );
        case "cancel":
          return await reply(
            "BillingCommandResult",
            billing + "/subscription:cancel",
            "POST",
          );
        default:
          throw new PlatformApiError(404, "not_found");
      }
    } catch (error) {
      const failure =
        error instanceof PlatformApiError
          ? error
          : error instanceof WireBodyLimitError
            ? new PlatformApiError(413, "payload_too_large")
            : error instanceof SyntaxError
              ? new PlatformApiError(400, "invalid_request")
              : new PlatformApiError(503, "edge_unavailable");
      const id = failure.correlationId ?? correlation;
      return Response.json(
        {
          type: "about:blank",
          title: "Request failed",
          detail: "Request could not be completed.",
          instance: new URL(request.url).pathname,
          status: failure.status,
          code: failure.code,
          correlationId: id,
          retryable: [429, 502, 503, 504].includes(failure.status),
          fieldErrors: failure.fieldErrors,
        },
        {
          status: failure.status,
          headers: {
            ...headers,
            "Content-Type": "application/problem+json",
            "X-Correlation-Id": id,
            ...(failure.retryAfter === undefined
              ? {}
              : { "Retry-After": String(failure.retryAfter) }),
          },
        },
      );
    }
  };
}
