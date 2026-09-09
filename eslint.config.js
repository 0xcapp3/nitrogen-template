/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  // Replaces .eslintignore, which ESLint 9 no longer reads.
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "public/build/**",
      ".shopify/**",
      ".react-router/**",
      "drizzle/**",
      "**/*.yml",
    ],
  },

  // Base
  js.configs.recommended,

  // React
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // App Bridge exposes a `shopify` global, including inside UI extensions.
        shopify: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
    rules: {
      "react/no-unknown-property": ["error", { ignore: ["variant"] }],
    },
  },

  // TypeScript
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      "import/internal-regex": "^~/",
      "import/resolver": {
        node: { extensions: [".ts", ".tsx"] },
        typescript: { alwaysTryTypes: true },
      },
    },
  },

  // Node
  {
    files: [
      "eslint.config.js",
      "vite.config.{js,ts}",
      "vitest.config.{js,ts}",
      ".graphqlrc.{js,ts}",
      "drizzle.config.{js,ts}",
      "app/shopify.server.{js,ts}",
      "app/shopify.domains.{js,ts}",
      "scripts/**/*.{js,mjs,ts}",
      "**/*.server.{js,ts,tsx}",
      "**/*.test.{js,ts,tsx}",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
);
