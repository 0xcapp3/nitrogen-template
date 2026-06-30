import {
  boolean,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const shopifySessions = pgTable("shopify_sessions", {
  id: text("id").primaryKey(),
  shop: text("shop").notNull(),
  state: text("state").notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  scope: text("scope"),
  expires: timestamp("expires", { mode: "date" }),
  accessToken: text("access_token"),
  userId: text("user_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  accountOwner: boolean("account_owner").default(false).notNull(),
  locale: text("locale"),
  collaborator: boolean("collaborator").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  refreshToken: text("refresh_token"),
  refreshTokenExpires: timestamp("refresh_token_expires", { mode: "date" }),
});
