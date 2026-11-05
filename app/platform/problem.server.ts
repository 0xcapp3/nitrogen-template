/** Safe errors produced by the edge itself, without upstream exception details. */
export function edgeProblem(
  request: Request,
  status: number,
  code: string,
  extra: HeadersInit = {},
): Response {
  const supplied = request.headers.get("x-correlation-id");
  const correlationId =
    supplied && /^[A-Za-z0-9:._-]{1,128}$/.test(supplied)
      ? supplied
      : crypto.randomUUID();
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/problem+json");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Correlation-Id", correlationId);
  return Response.json(
    {
      type: "urn:nitrogen:problem:" + code,
      title: "Request failed",
      status,
      detail: "The request could not be completed.",
      instance: new URL(request.url).pathname,
      code,
      correlationId,
      retryable: [429, 502, 503, 504].includes(status),
      fieldErrors: [],
    },
    { status, headers },
  );
}
