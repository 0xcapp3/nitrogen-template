import type { ActionFunctionArgs } from "react-router";
import { eq } from "drizzle-orm";
import { db } from "../db.server";
import { shopifySessions } from "../db/schema";
import { authenticate } from "../shopify.server";

const PRIVACY_TOPICS = new Set([
  "customers/data_request",
  "customers/redact",
  "shop/redact",
]);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} privacy webhook for ${shop}`);

  if (!PRIVACY_TOPICS.has(topic)) {
    return new Response("Unsupported privacy webhook topic", { status: 400 });
  }

  if (topic === "shop/redact") {
    await db.delete(shopifySessions).where(eq(shopifySessions.shop, shop));
  }

  // This template stores Shopify sessions only. Apps that store customer data
  // must add app-specific export/redaction behavior here.
  return new Response();
};
