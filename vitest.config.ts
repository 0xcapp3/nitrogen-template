import { defineConfig } from "vitest/config";

/**
 * Deliberately separate from `vite.config.ts`: that config loads the
 * `reactRouter()` plugin, which builds the route graph and is pure noise in a
 * test run.
 *
 * Two projects, because they have different prerequisites:
 *
 * - `unit` needs nothing. It runs as part of `yarn check`.
 * - `integration` needs a reachable Docker daemon — it starts a throwaway
 *   PostgreSQL container per suite via testcontainers. Kept out of
 *   `yarn check` so that committing does not depend on Docker being up.
 *
 * `globals` is left off: tests import `describe`/`it`/`expect` from `vitest`
 * explicitly, which keeps `eslint.config.js` free of test-only globals.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["app/**/*.test.ts"],
          exclude: ["app/**/*.integration.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          environment: "node",
          include: ["app/**/*.integration.test.ts"],
          // Pulling the postgres image on a cold cache dominates the first run.
          testTimeout: 60_000,
          hookTimeout: 180_000,
        },
      },
    ],
  },
});
