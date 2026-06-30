import type { ActionFunctionArgs } from "react-router";
import { eq } from "drizzle-orm";
import { db } from "../db.server";
import { shopifySessions } from "../db/schema";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.delete(shopifySessions).where(eq(shopifySessions.shop, shop));
  }

  return new Response();
};
