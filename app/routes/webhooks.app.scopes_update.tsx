import type { ActionFunctionArgs } from "react-router";
import { eq } from "drizzle-orm";
import { db } from "../db.server";
import { shopifySessions } from "../db/schema";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { payload, session, topic, shop } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    if (session) {
        await db
            .update(shopifySessions)
            .set({ scope: current.toString() })
            .where(eq(shopifySessions.id, session.id));
    }
    return new Response();
};
