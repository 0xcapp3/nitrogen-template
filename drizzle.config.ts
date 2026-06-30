import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ override: true });

export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
