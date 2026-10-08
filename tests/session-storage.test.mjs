import "@shopify/shopify-api/adapters/node";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { test } from "node:test";
import { Session } from "@shopify/shopify-api";
import { eq } from "drizzle-orm";
import { createServer } from "vite";

test(
  "Drizzle sessions preserve Shopify API 15 tokens, online user data and deletion",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY =
      randomBytes(32).toString("base64");

    const server = await createServer({
      configFile: false,
      appType: "custom",
      logLevel: "error",
      server: { middlewareMode: true, ws: false, watch: null },
    });
    const shop = `storage-test-${randomUUID()}.myshopify.com`;
    let storage;

    try {
      const { DrizzleSessionStorage } = await server.ssrLoadModule(
        "/app/db/session.storage.ts",
      );
      const { db } = await server.ssrLoadModule("/app/db.server.ts");
      const { shopifySessions } =
        await server.ssrLoadModule("/app/db/schema.ts");
      storage = new DrizzleSessionStorage();

      const offline = new Session({
        id: `offline_${shop}`,
        shop,
        state: "test-state",
        isOnline: false,
        scope: "write_products",
        accessToken: "test-access-token",
        expires: new Date("2030-01-01T00:00:00Z"),
      });
      offline.refreshToken = "test-refresh-token";
      offline.refreshTokenExpires = new Date("2030-02-01T00:00:00Z");

      assert.equal(await storage.storeSession(offline), true);
      const loaded = await storage.loadSession(offline.id);
      assert.ok(loaded);
      assert.equal(loaded.shop, shop);
      assert.equal(loaded.scope, offline.scope);
      assert.equal(loaded.isOnline, false);
      assert.equal(loaded.accessToken, offline.accessToken);
      assert.equal(loaded.refreshToken, offline.refreshToken);
      assert.deepEqual(loaded.expires, offline.expires);
      assert.deepEqual(loaded.refreshTokenExpires, offline.refreshTokenExpires);

      const [row] = await db
        .select()
        .from(shopifySessions)
        .where(eq(shopifySessions.id, offline.id));
      assert.ok(row.accessToken);
      assert.ok(row.refreshToken);
      assert.notEqual(row.accessToken, offline.accessToken);
      assert.notEqual(row.refreshToken, offline.refreshToken);

      offline.accessToken = "refreshed-access-token";
      offline.refreshToken = "rotated-refresh-token";
      assert.equal(await storage.storeSession(offline), true);
      const refreshed = await storage.loadSession(offline.id);
      assert.equal(refreshed.accessToken, offline.accessToken);
      assert.equal(refreshed.refreshToken, offline.refreshToken);

      const online = new Session({
        id: `online_${shop}`,
        shop,
        state: "test-state",
        isOnline: true,
        scope: "write_products",
        accessToken: "online-access-token",
        expires: new Date(Date.now() + 60_000),
      });
      online.onlineAccessInfo = {
        expires_in: 60,
        associated_user_scope: "write_products",
        associated_user: {
          id: 123,
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          account_owner: true,
          locale: "en",
          collaborator: false,
          email_verified: true,
        },
      };
      assert.equal(await storage.storeSession(online), true);
      const loadedOnline = await storage.loadSession(online.id);
      assert.equal(loadedOnline.isOnline, true);
      assert.deepEqual(
        loadedOnline.onlineAccessInfo.associated_user,
        online.onlineAccessInfo.associated_user,
      );
      assert.equal(
        loadedOnline.onlineAccessInfo.associated_user_scope,
        "write_products",
      );
      assert.equal((await storage.findSessionsByShop(shop)).length, 2);

      assert.equal(await storage.deleteSession(online.id), true);
      assert.equal(await storage.loadSession(online.id), undefined);
      assert.equal(await storage.deleteSessions([offline.id]), true);
      assert.deepEqual(await storage.findSessionsByShop(shop), []);
    } finally {
      try {
        if (storage) {
          const sessions = await storage.findSessionsByShop(shop);
          if (sessions.length) {
            await storage.deleteSessions(sessions.map((session) => session.id));
          }
        }
      } finally {
        await globalThis.postgresClient?.end({ timeout: 5 });
        delete globalThis.postgresClient;
        await server.close();
      }
    }
  },
);
