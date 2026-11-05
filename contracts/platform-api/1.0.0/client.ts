import {
  apiUrl,
  encodeWireJson,
  readWireJson,
  type Int64Fields,
} from "./transport";

export class PlatformApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly correlationId?: string,
    readonly retryAfter?: number,
    readonly fieldErrors: readonly {
      path: string;
      code: string;
      message: string;
    }[] = [],
  ) {
    super("Platform API request failed");
    this.name = "PlatformApiError";
  }
}

function fields(
  value: unknown,
): value is { path: string; code: string; message: string }[] {
  return (
    Array.isArray(value) &&
    value.length <= 1000 &&
    value.every(
      (field) =>
        field !== null &&
        typeof field === "object" &&
        typeof field.path === "string" &&
        field.path.length <= 512 &&
        typeof field.code === "string" &&
        field.code.length <= 128 &&
        typeof field.message === "string",
    )
  );
}

/** Validate the common error envelope at either the browser or provider boundary. */
export function problemError(
  response: Response,
  value: unknown,
): PlatformApiError {
  const correlation = response.headers.get("x-correlation-id");
  if (
    !correlation ||
    !/^[A-Za-z0-9:._-]{1,128}$/.test(correlation) ||
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
      "application/problem+json"
  )
    return new PlatformApiError(502, "edge_invalid_response");
  if (
    !value ||
    typeof value !== "object" ||
    !("code" in value) ||
    typeof value.code !== "string" ||
    !/^[a-z][a-z0-9_]{0,63}$/.test(value.code) ||
    !("status" in value) ||
    value.status !== response.status ||
    !("correlationId" in value) ||
    value.correlationId !== correlation ||
    !("fieldErrors" in value) ||
    !fields(value.fieldErrors)
  )
    throw new PlatformApiError(502, "edge_invalid_response");
  const retry = response.headers.get("retry-after");
  return new PlatformApiError(
    response.status,
    value.code,
    correlation,
    retry !== null && /^[0-9]{1,5}$/.test(retry)
      ? Math.min(Number(retry), 86400)
      : undefined,
    value.fieldErrors.map((field) => ({
      path: field.path,
      code: field.code,
      message: "Invalid value",
    })),
  );
}

export type ApiRequest<T> = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  idToken: string;
  query?: Readonly<Record<string, string>>;
  body?: unknown;
  idempotencyKey?: string;
  requestInt64?: Int64Fields;
  responseInt64?: Int64Fields;
  validate: (value: unknown) => value is T;
};

/** Server-side transport; the host supplies its own application workload credential. No retries. */
export class PlatformApiClient {
  constructor(
    private readonly options: {
      baseUrl: string;
      serviceToken: () => Promise<string>;
      allowLocalHttp?: boolean;
      fetch?: typeof fetch;
      timeoutMs?: number;
    },
  ) {}

  async request<T>(request: ApiRequest<T>): Promise<T> {
    let url: string, service: string;
    try {
      url = apiUrl(
        this.options.baseUrl,
        request.path,
        this.options.allowLocalHttp,
      );
      if (request.query) {
        const target = new URL(url);
        for (const [key, value] of Object.entries(request.query)) {
          if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || value.length > 4096)
            throw new Error("Invalid query");
          target.searchParams.set(key, value);
        }
        url = target.href;
      }
      service = await this.options.serviceToken();
    } catch {
      throw new PlatformApiError(503, "edge_unavailable");
    }
    if (!/^[0-9a-f]{64}$/.test(service))
      throw new PlatformApiError(503, "edge_unavailable");
    if (
      request.idToken.length > 16384 ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(request.idToken)
    )
      throw new PlatformApiError(401, "unauthorized");
    if (
      request.idempotencyKey !== undefined &&
      !/^[A-Za-z0-9_-]{16,128}$/.test(request.idempotencyKey)
    )
      throw new PlatformApiError(400, "invalid_request");
    const abort = new AbortController();
    const timer = setTimeout(
      () => abort.abort(),
      this.options.timeoutMs ?? 15000,
    );
    try {
      const response = await (this.options.fetch ?? fetch)(url, {
        method: request.method ?? "GET",
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
        signal: abort.signal,
        headers: {
          Authorization: `Bearer ${service}`,
          "X-Shopify-Id-Token": request.idToken,
          Accept: "application/json, application/problem+json",
          ...(request.body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
          ...(request.idempotencyKey === undefined
            ? {}
            : { "Idempotency-Key": request.idempotencyKey }),
        },
        ...(request.body === undefined
          ? {}
          : { body: encodeWireJson(request.body, request.requestInt64) }),
      });
      const correlation = response.headers.get("x-correlation-id");
      const expectedType = response.ok
        ? "application/json"
        : "application/problem+json";
      if (
        response.headers.get("cache-control") !== "no-store" ||
        !correlation ||
        correlation.length > 128 ||
        response.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .toLowerCase() !== expectedType
      ) {
        await response.body?.cancel();
        throw new PlatformApiError(502, "edge_invalid_response");
      }
      const value = await readWireJson(
        response,
        response.ok ? request.responseInt64 : [],
      );
      if (!response.ok) throw problemError(response, value);
      if (!request.validate(value))
        throw new PlatformApiError(502, "edge_invalid_response", correlation);
      return value;
    } catch (error) {
      if (error instanceof PlatformApiError) throw error;
      throw new PlatformApiError(
        abort.signal.aborted ? 504 : 502,
        abort.signal.aborted ? "edge_timeout" : "edge_invalid_response",
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
