import { Session } from "@shopify/shopify-api";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db.server";
import { shopifySessions } from "./schema";
import { decryptToken, encryptToken } from "./token-crypto.server";

type SessionRow = typeof shopifySessions.$inferSelect;

function sessionValues(session: Session) {
  const associatedUser = session.onlineAccessInfo?.associated_user;

  return {
    shop: session.shop,
    state: session.state,
    isOnline: session.isOnline,
    scope: session.scope ?? null,
    expires: session.expires ?? null,
    accessToken: encryptToken(session.accessToken ?? null),
    userId: associatedUser?.id ? String(associatedUser.id) : null,
    firstName: associatedUser?.first_name ?? null,
    lastName: associatedUser?.last_name ?? null,
    email: associatedUser?.email ?? null,
    accountOwner: associatedUser?.account_owner ?? false,
    locale: associatedUser?.locale ?? null,
    collaborator: associatedUser?.collaborator ?? false,
    emailVerified: associatedUser?.email_verified ?? false,
    refreshToken: encryptToken(session.refreshToken ?? null),
    refreshTokenExpires: session.refreshTokenExpires ?? null,
  };
}

function rowToSession(row: SessionRow): Session {
  const session = new Session({
    id: row.id,
    shop: row.shop,
    state: row.state,
    isOnline: row.isOnline,
    scope: row.scope ?? undefined,
    expires: row.expires ?? undefined,
    accessToken: decryptToken(row.accessToken) ?? undefined,
  });

  if (row.refreshToken) {
    session.refreshToken = decryptToken(row.refreshToken) ?? undefined;
  }

  if (row.refreshTokenExpires) {
    session.refreshTokenExpires = row.refreshTokenExpires;
  }

  if (row.userId) {
    session.onlineAccessInfo = {
      expires_in: row.expires
        ? Math.max(0, Math.floor((row.expires.getTime() - Date.now()) / 1000))
        : 0,
      associated_user: {
        id: Number(row.userId),
        first_name: row.firstName ?? "",
        last_name: row.lastName ?? "",
        email: row.email ?? "",
        account_owner: row.accountOwner,
        locale: row.locale ?? "",
        collaborator: row.collaborator,
        email_verified: row.emailVerified,
      },
      associated_user_scope: row.scope ?? "",
    };
  }

  return session;
}

export class DrizzleSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    try {
      const values = sessionValues(session);

      await db
        .insert(shopifySessions)
        .values({ id: session.id, ...values })
        .onConflictDoUpdate({
          target: shopifySessions.id,
          set: values,
        });

      return true;
    } catch (error) {
      console.error(
        new Error(
          `[DrizzleSessionStorage] Failed to store session for shop ${session.shop}`,
          { cause: error },
        ),
      );
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const row = await db
        .select()
        .from(shopifySessions)
        .where(eq(shopifySessions.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      return row ? rowToSession(row) : undefined;
    } catch (error) {
      console.error(
        new Error(
          `[DrizzleSessionStorage] Failed to load session with id ${id}`,
          { cause: error },
        ),
      );
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await db.delete(shopifySessions).where(eq(shopifySessions.id, id));
      return true;
    } catch (error) {
      console.error(
        new Error(
          `[DrizzleSessionStorage] Failed to delete session with id ${id}`,
          { cause: error },
        ),
      );
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await db.delete(shopifySessions).where(inArray(shopifySessions.id, ids));
      return true;
    } catch (error) {
      console.error(
        new Error("[DrizzleSessionStorage] Failed to delete sessions", {
          cause: error,
        }),
      );
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const rows = await db
        .select()
        .from(shopifySessions)
        .where(eq(shopifySessions.shop, shop));

      return rows.map(rowToSession);
    } catch (error) {
      console.error(
        new Error(
          `[DrizzleSessionStorage] Failed to find sessions by shop ${shop}`,
          { cause: error },
        ),
      );
      return [];
    }
  }
}
