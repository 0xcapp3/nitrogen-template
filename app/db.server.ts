import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";

const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

const client =
  globalForDb.postgresClient ??
  (process.env.DATABASE_URL
    ? postgres(process.env.DATABASE_URL)
    : postgres());

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

const db = drizzle(client, { schema });

export { db };
export default db;
