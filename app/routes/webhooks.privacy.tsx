import type { ActionFunctionArgs } from "react-router";
import { createWebhookRelay } from "../services/webhooks.server";
import { runtime } from "../platform/runtime.server";
export const action = ({ request }: ActionFunctionArgs) =>
  createWebhookRelay({
    origin: runtime.baseUrl(),
    applicationKey: runtime.applicationKey(),
    token: runtime.serviceToken,
    allowLocalHttp: runtime.allowLocalHttp,
  })(request, ["customers/data_request", "customers/redact", "shop/redact"]);
