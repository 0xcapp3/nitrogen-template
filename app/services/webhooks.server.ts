import { edgeProblem } from "../platform/problem.server";
import { apiUrl } from "../../contracts/platform-api/1.0.0/transport";

const headersToForward: readonly [
  "x-shopify-hmac-sha256",
  "x-shopify-topic",
  "x-shopify-shop-domain",
  "x-shopify-webhook-id",
  "x-shopify-triggered-at",
  "x-shopify-event-id",
] = [
  "x-shopify-hmac-sha256",
  "x-shopify-topic",
  "x-shopify-shop-domain",
  "x-shopify-webhook-id",
  "x-shopify-triggered-at",
  "x-shopify-event-id",
] as const;

/** Forward original bytes; only Platform verifies HMAC and acknowledges durable intake. */
export function createWebhookRelay(options: {
  origin: string;
  token: string | (() => Promise<string>);
  applicationKey?: string;
  transport?: typeof fetch;
  allowLocalHttp?: boolean;
  timeoutMs?: number;
}) {
  return async (
    request: Request,
    topics: readonly string[],
  ): Promise<Response> => {
    const fail: (status: number) => Response = (status: number) =>
      edgeProblem(
        request,
        status,
        (
          {
            400: "invalid_request",
            401: "unauthorized",
            403: "forbidden",
            413: "payload_too_large",
            415: "unsupported_media_type",
          } as Record<number, string>
        )[status] ?? "webhook_unavailable",
      );
    if (request.method !== "POST")
      return edgeProblem(request, 405, "method_not_allowed", { Allow: "POST" });
    if (
      new URL(request.url).search ||
      !topics.includes(request.headers.get("x-shopify-topic") ?? "")
    )
      return fail(400);
    if (
      !/^application\/json(?:;|$)/i.test(
        request.headers.get("content-type") ?? "",
      )
    )
      return fail(415);
    const controller: AbortController = new AbortController();
    const timer: NodeJS.Timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 3500,
    );
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const application = options.applicationKey ?? "";
      if (!/^[a-z][a-z0-9-]{0,63}$/.test(application)) return fail(503);
      const destination = apiUrl(
        options.origin,
        `/shopify/apps/${application}/webhooks`,
        options.allowLocalHttp,
      );
      const token =
        typeof options.token === "string"
          ? options.token
          : await options.token();
      if (!/^[0-9a-f]{64}$/.test(token)) return fail(503);
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });
      for (const name of headersToForward) {
        const value: ReturnType<typeof request.headers.get> =
          request.headers.get(name);
        if (value !== null) {
          if (!value || value.length > 256 || /[\r\n,]/.test(value))
            return fail(400);
          headers.set(name, value);
        } else if (
          !["x-shopify-triggered-at", "x-shopify-event-id"].includes(name)
        )
          return fail(400);
      }
      const chunks: Uint8Array[] = [];
      let size: number = 0;
      reader = request.body?.getReader();
      controller.signal.addEventListener(
        "abort",
        () => {
          void reader?.cancel().catch(() => undefined);
        },
        { once: true },
      );
      if (reader)
        for (;;) {
          const { done, value }: Awaited<ReturnType<typeof reader.read>> =
            await reader.read();
          if (done) break;
          size += value.length;
          if (size > 1048576) return fail(413);
          chunks.push(value);
        }
      if (controller.signal.aborted) return fail(503);
      const body: Uint8Array<ArrayBuffer> = new Uint8Array(size);
      let offset: number = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.length;
      }
      const response: Response = await (options.transport ?? fetch)(
        destination,
        {
          method: "POST",
          headers,
          body: body.buffer,
          signal: controller.signal,
          redirect: "error",
          credentials: "omit",
          cache: "no-store",
        },
      );
      await response.body?.cancel();
      if (response.status === 204)
        return new Response(null, {
          status: 204,
          headers: { "Cache-Control": "no-store" },
        });
      return fail(
        [400, 401, 403, 413, 415].includes(response.status)
          ? response.status
          : 503,
      );
    } catch {
      return fail(503);
    } finally {
      clearTimeout(timer);
      await reader?.cancel().catch(() => undefined);
      reader?.releaseLock();
    }
  };
}
