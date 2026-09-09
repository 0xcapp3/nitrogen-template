import "@shopify/shopify-api/adapters/node";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Session } from "@shopify/shopify-api";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import * as schema from "./schema";
import { DrizzleSessionStorage } from "./session.storage";

const { shopifySessions } = schema;

/**
 * Built through a helper so the inferred type carries the schema module, which
 * is what `DrizzleSessionStorage` expects. Passing an inline `{ shopifySessions }`
 * object literal widens it to `Record<string, unknown>` and stops matching.
 */
const connect = (client: postgres.Sql) => drizzle(client, { schema });

/**
 * Integration coverage for the piece of this fork that upstream does not have:
 * a hand-written `SessionStorage` on Drizzle + PostgreSQL.
 *
 * Runs against a throwaway container on the same image as `compose.yaml`, with
 * the *committed* migrations from `drizzle/` applied — so this also asserts
 * that those migrations produce a schema the adapter can actually work with,
 * which nothing else checks. It uses the real `postgres-js` driver, the same
 * one `app/db.server.ts` uses in production.
 *
 * Requires a reachable Docker daemon. Excluded from `yarn check`; run with
 * `yarn test:integration`.
 */

const IMAGE = "postgres:17-alpine";
const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

let container: StartedPostgreSqlContainer;
let client: postgres.Sql;
let database: ReturnType<typeof connect>;
let storage: DrizzleSessionStorage;

function offlineSession(overrides: Partial<Session> = {}) {
  const session = new Session({
    id: "offline_test-shop.myshopify.com",
    shop: "test-shop.myshopify.com",
    state: "state-1",
    isOnline: false,
    scope: "write_products",
    accessToken: "shpat_offline_token",
    ...overrides,
  });

  return session;
}

function onlineSession() {
  const session = new Session({
    id: "online_test-shop.myshopify.com_42",
    shop: "test-shop.myshopify.com",
    state: "state-2",
    isOnline: true,
    scope: "write_products",
    accessToken: "shpat_online_token",
    expires: new Date(Date.now() + 60_000),
  });

  session.onlineAccessInfo = {
    expires_in: 60,
    associated_user_scope: "write_products",
    associated_user: {
      id: 42,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      account_owner: true,
      locale: "en",
      collaborator: false,
      email_verified: true,
    },
  };

  return session;
}

beforeAll(async () => {
  // Encryption is on for the whole suite, so the at-rest assertions below are
  // meaningful rather than testing the plaintext fallback.
  process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY = ENCRYPTION_KEY;

  container = await new PostgreSqlContainer(IMAGE).start();
  client = postgres(container.getConnectionUri());
  database = connect(client);

  await migrate(database, { migrationsFolder: "./drizzle" });

  storage = new DrizzleSessionStorage(database);
});

afterAll(async () => {
  await client?.end();
  await container?.stop();
  delete process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
});

beforeEach(async () => {
  await database.delete(shopifySessions);
});

describe("storeSession / loadSession", () => {
  it("round-trips an offline session", async () => {
    const session = offlineSession();

    expect(await storage.storeSession(session)).toBe(true);

    const loaded = await storage.loadSession(session.id);

    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe(session.id);
    expect(loaded!.shop).toBe(session.shop);
    expect(loaded!.state).toBe(session.state);
    expect(loaded!.isOnline).toBe(false);
    expect(loaded!.scope).toBe("write_products");
    expect(loaded!.accessToken).toBe("shpat_offline_token");
  });

  it("round-trips an online session, including the associated user", async () => {
    const session = onlineSession();

    expect(await storage.storeSession(session)).toBe(true);

    const loaded = await storage.loadSession(session.id);

    expect(loaded!.isOnline).toBe(true);
    expect(loaded!.accessToken).toBe("shpat_online_token");
    expect(loaded!.onlineAccessInfo?.associated_user).toMatchObject({
      id: 42,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      account_owner: true,
      collaborator: false,
      email_verified: true,
    });
  });

  it("round-trips the refresh token and its expiry", async () => {
    const expires = new Date(Date.now() + 120_000);
    const session = offlineSession();
    session.refreshToken = "shprt_refresh_token";
    session.refreshTokenExpires = expires;

    await storage.storeSession(session);
    const loaded = await storage.loadSession(session.id);

    expect(loaded!.refreshToken).toBe("shprt_refresh_token");
    expect(loaded!.refreshTokenExpires?.getTime()).toBe(expires.getTime());
  });

  it("returns undefined for an unknown id", async () => {
    expect(await storage.loadSession("does-not-exist")).toBeUndefined();
  });

  it("updates in place on conflict rather than failing on the primary key", async () => {
    const session = offlineSession();
    await storage.storeSession(session);

    session.scope = "write_products,read_orders";
    session.accessToken = "shpat_rotated_token";

    expect(await storage.storeSession(session)).toBe(true);

    const rows = await database.select().from(shopifySessions);
    expect(rows).toHaveLength(1);

    const loaded = await storage.loadSession(session.id);
    expect(loaded!.scope).toBe("write_products,read_orders");
    expect(loaded!.accessToken).toBe("shpat_rotated_token");
  });
});

describe("encryption at rest", () => {
  it("writes the access token encrypted but reads it back in clear", async () => {
    const session = offlineSession();
    await storage.storeSession(session);

    const [row] = await database
      .select()
      .from(shopifySessions)
      .where(eq(shopifySessions.id, session.id));

    expect(row.accessToken).toMatch(/^enc:v1:/);
    expect(row.accessToken).not.toContain("shpat_offline_token");

    expect((await storage.loadSession(session.id))!.accessToken).toBe(
      "shpat_offline_token",
    );
  });

  it("encrypts the refresh token too", async () => {
    const session = offlineSession();
    session.refreshToken = "shprt_refresh_token";
    await storage.storeSession(session);

    const [row] = await database
      .select()
      .from(shopifySessions)
      .where(eq(shopifySessions.id, session.id));

    expect(row.refreshToken).toMatch(/^enc:v1:/);
    expect(row.refreshToken).not.toContain("shprt_refresh_token");
  });
});

describe("deleteSession / deleteSessions", () => {
  it("deletes a single session", async () => {
    const session = offlineSession();
    await storage.storeSession(session);

    expect(await storage.deleteSession(session.id)).toBe(true);
    expect(await storage.loadSession(session.id)).toBeUndefined();
  });

  it("reports success when deleting an id that is not there", async () => {
    // The uninstall webhook can fire more than once; a second delete must not
    // be treated as a failure.
    expect(await storage.deleteSession("does-not-exist")).toBe(true);
  });

  it("deletes many sessions at once and leaves the others alone", async () => {
    const a = offlineSession({ id: "a" } as Partial<Session>);
    const b = offlineSession({ id: "b" } as Partial<Session>);
    const c = offlineSession({ id: "c" } as Partial<Session>);
    await Promise.all([a, b, c].map((s) => storage.storeSession(s)));

    expect(await storage.deleteSessions(["a", "b"])).toBe(true);

    const rows = await database.select().from(shopifySessions);
    expect(rows.map((row) => row.id)).toEqual(["c"]);
  });
});

describe("findSessionsByShop", () => {
  it("returns every session for a shop and nothing for others", async () => {
    await storage.storeSession(offlineSession());
    await storage.storeSession(onlineSession());
    await storage.storeSession(
      new Session({
        id: "offline_other-shop.myshopify.com",
        shop: "other-shop.myshopify.com",
        state: "state-3",
        isOnline: false,
        accessToken: "shpat_other",
      }),
    );

    const found = await storage.findSessionsByShop("test-shop.myshopify.com");

    expect(found).toHaveLength(2);
    expect(found.every((s) => s.shop === "test-shop.myshopify.com")).toBe(true);
    expect(found.map((s) => s.accessToken).sort()).toEqual([
      "shpat_offline_token",
      "shpat_online_token",
    ]);
  });

  it("returns an empty array for a shop with no sessions", async () => {
    expect(await storage.findSessionsByShop("nobody.myshopify.com")).toEqual([]);
  });
});
