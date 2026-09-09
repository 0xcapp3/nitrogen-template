# Shopify App Template - React Router

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using [React Router](https://reactrouter.com/). It was forked from the [Shopify Remix app template](https://github.com/Shopify/shopify-app-template-remix) and converted to React Router.

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-react-router) for more details on the React Router app package.

## About this fork

This is an internal fork of the official [Shopify React Router app template](https://github.com/Shopify/shopify-app-template-react-router). It deviates from upstream in the following ways:

- **Session storage**: [Drizzle ORM](https://orm.drizzle.team/) with **PostgreSQL** replaces Prisma/SQLite. Sessions are stored via a custom `SessionStorage` adapter (`app/db/session.storage.ts`), with the schema in `app/db/schema.ts` and migrations in the root-level `drizzle/` directory. Prisma is not used.
- **Package manager**: [Yarn 4](https://yarnpkg.com/) (`4.14.1`) via Corepack, with `nodeLinker: node-modules` (no PnP).
- **Internal hardening**: production fails fast without `DATABASE_URL` and `SHOPIFY_TOKEN_ENCRYPTION_KEY`, Shopify tokens can be encrypted at rest, and public-app privacy webhook stubs are included.
- **Dependencies ahead of upstream**: `@shopify/shopify-app-react-router` v2 (upstream is still on v1), ESLint 9 with flat config (`eslint.config.js`, upstream still ships `.eslintrc.cjs`), TypeScript 6, Vite 8, Admin API `2026-04`, and Node 24 as the runtime. See `CHANGELOG.md` for the reasoning behind each.
- **React Router pinned to `7.18.2`**: exact versions, not ranges. 7.18.3 breaks every action POST under `shopify app dev`; the pin is enforced in `package.json` and mirrored by `ignore` rules in `.github/dependabot.yml`, both of which carry the full explanation. Because those `ignore` rules also suppress security updates, `.github/workflows/audit.yml` watches the pinned packages on a schedule.
- **Tests**: Vitest, with unit coverage for the fork-specific code and a testcontainers-backed integration suite for the session storage. Upstream ships no tests.
- **Trimmed CI**: the upstream repo-maintenance workflows (CLA, issue gardening, the generated `javascript` branch) are removed; only `ci.yml` and `audit.yml` remain.

Note on dependency overrides: under Yarn only `resolutions` takes effect — the `overrides` block in `package.json` is inert here and matters only to anyone installing this template with npm.

The rest intentionally matches upstream to keep the fork easy to update. To sync with the official template:

```shell
git fetch upstream
git merge upstream/main
```

(The `upstream` remote points to `https://github.com/Shopify/shopify-app-template-react-router.git`.)

## Upgrading from Remix

If you have an existing Remix app that you want to upgrade to React Router, please follow the [upgrade guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix). Otherwise, please follow the quick start guide below.

## Quick start

### Prerequisites

Before you begin, you'll need:

1. The [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started) installed.
2. **Node.js 24** — the range is `>=24 <25`, and the upper bound is deliberate. Corepack was removed from the Node distribution in v25, and this repo vendors no Yarn release in `.yarn/releases`, so on Node 25+ there is no `yarn` at all unless you install one yourself. Node 24 is also what CI and the `Dockerfile` run.
3. A running **PostgreSQL** database, reachable via the `DATABASE_URL` environment variable.
4. [Docker](https://docs.docker.com/get-started/get-docker/) — only for `yarn test:integration`, which starts a throwaway PostgreSQL container. Not needed for `yarn check`.

The Node version is pinned in three places that must stay in sync: `.nvmrc` (the portable source of truth, also consumed by CI), `mise.toml`, and `engines.node` in `package.json`.

Pick whichever version manager you use:

```shell
mise install          # reads mise.toml — also provides Yarn, no Corepack needed
nvm use               # reads .nvmrc — then `corepack enable` for Yarn
fnm use               # reads .nvmrc — then `corepack enable` for Yarn
```

### Setup

Clone this repository, then:

```shell
corepack enable   # skip if your version manager already provides Yarn
yarn install
cp .env.example .env
```

If you don't have a PostgreSQL instance available, you can start a local one with Docker (exposed on port `5440` to avoid clashing with other local Postgres instances):

```shell
docker compose up -d
```

Set `DATABASE_URL` to your PostgreSQL connection string (e.g. in a `.env` file). For the Docker Compose database above:

```shell
DATABASE_URL=postgres://app:password@localhost:5440/app
```

For production, set `SHOPIFY_TOKEN_ENCRYPTION_KEY` to a 32-byte base64 key:

```shell
openssl rand -base64 32
```

Apply the Drizzle migrations (from the root-level `drizzle/` directory):

```shell
yarn setup
```

### Local Development

```shell
yarn dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return nodes;
}
```

This template comes pre-configured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/shopify.server.ts)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/app._index.tsx).
3. Responding to webhooks. Please see [/app/routes/webhooks.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/webhooks.app.uninstalled.tsx).

Please read the [documentation for @shopify/shopify-app-react-router](https://shopify.dev/docs/api/shopify-app-react-router) to see what other API's are available.

## Shopify Dev MCP

This template is configured with the Shopify Dev MCP. This instructs [Cursor](https://cursor.com/), [GitHub Copilot](https://github.com/features/copilot) and [Claude Code](https://claude.com/product/claude-code) and [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) to use the Shopify Dev MCP.

For more information on the Shopify Dev MCP please read [the documentation](https://shopify.dev/docs/apps/build/devmcp).

## Deployment

### Application Storage

This template uses [Drizzle ORM](https://orm.drizzle.team/) to store session data, by default using a **PostgreSQL** database configured via the `DATABASE_URL` environment variable.

The relevant files are:

- `app/db/schema.ts` — Drizzle schema (the `shopify_sessions` table)
- `app/db/session.storage.ts` — custom `SessionStorage` adapter
- `app/db.server.ts` — database client
- `drizzle.config.ts` — Drizzle Kit configuration
- `drizzle/` — generated SQL migrations (applied with `yarn setup`)

If you change the schema, generate a new migration and apply it:

```shell
yarn db:generate
yarn setup
```

PostgreSQL is the default and only configuration supported out of the box. Drizzle also supports other dialects (e.g. SQLite or MySQL) if you adjust `drizzle.config.ts`, the schema, and the database client accordingly. Alternatively, a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/session-storage.md) can be used.

### Token Encryption

Shopify access and refresh tokens are encrypted at rest when `SHOPIFY_TOKEN_ENCRYPTION_KEY` is set. The key is required in production and optional in development/test for local DX.

Generate a key with:

```shell
openssl rand -base64 32
```

### Privacy Webhooks

Public apps must subscribe to Shopify's mandatory privacy compliance topics. This template includes a generic `/webhooks/privacy` route that acknowledges `customers/data_request`, `customers/redact`, and `shop/redact`.

The template stores Shopify session data only; `shop/redact` deletes sessions for the shop. Apps that store customer or shop data must extend `app/routes/webhooks.privacy.tsx` with app-specific export/redaction behavior.

### Build

This fork uses Yarn as the default package manager. Build the app with:

```shell
yarn build
```

Run the internal check suite with:

```shell
yarn check
```

### Tests

```shell
yarn test              # unit tests — no prerequisites, included in `yarn check`
yarn test:watch
yarn test:integration  # requires a running Docker daemon
```

Unit tests cover the parts of this fork that upstream does not have: token encryption at rest (`app/db/token-crypto.server.ts`), the custom shop domain handling (`app/shopify.domains.ts`), and login error mapping.

`yarn test:integration` exercises the Drizzle `SessionStorage` against a throwaway PostgreSQL container started by [testcontainers](https://node.testcontainers.org/), on the same image as `compose.yaml`, with the committed migrations from `drizzle/` applied. It uses the real `postgres-js` driver, so it also covers the migrations themselves.

It is deliberately kept out of `yarn check` so that running the checks — or committing — never depends on Docker being up.

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/launch/deployment) to host it externally. From there, you have a few options:

- [Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run): This tutorial is written specifically for this example repo, and is compatible with the extended steps included in the subsequent [**Build your app**](tutorial) in the **Getting started** docs. It is the most detailed tutorial for taking a React Router-based Shopify app and deploying it to production. It includes configuring permissions and secrets, setting up a production database, and even hosting your apps behind a load balancer across multiple regions.
- [Fly.io](https://fly.io/docs/js/shopify/): Leverages the Fly.io CLI to quickly launch Shopify apps to a single machine.
- [Render](https://render.com/docs/deploy-shopify-app): This tutorial guides you through using Docker to deploy and install apps on a Dev store.
- [Manual deployment guide](https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service): This resource provides general guidance on the requirements of deployment including environment variables, secrets, and persistent data.

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variables `NODE_ENV=production`, `DATABASE_URL`, and `SHOPIFY_TOKEN_ENCRYPTION_KEY`.

`SHOP_CUSTOM_DOMAIN` is optional: set it to a custom shop domain suffix (e.g. `custom.domain.com`) for split-domain setups, and shops on it will be accepted as valid. See `app/shopify.domains.ts`.

## Gotchas / Troubleshooting

### Database tables don't exist

If you get an error like:

```
relation "shopify_sessions" does not exist
```

The Drizzle migrations haven't been applied to your database. Make sure `DATABASE_URL` points to your PostgreSQL database and run:

```shell
yarn setup
```

### `yarn test:integration` times out waiting for container ports

```
Timed out after 10000ms while waiting for container ports to be bound to the host
```

testcontainers allows itself only 10 seconds to see a container's ports bound, and that budget is not configurable per-run. On a cold image cache the pull eats it, and the run fails before PostgreSQL is even reached — usually on the `testcontainers/ryuk` sidecar rather than on Postgres itself. Pull the images once and re-run:

```shell
docker pull postgres:17-alpine
docker pull testcontainers/ryuk:0.14.0
```

CI sidesteps this by pre-pulling the database image and setting `TESTCONTAINERS_RYUK_DISABLED=true` — the runner is thrown away after the job, so there is nothing for Ryuk to reap.

### Navigating/redirecting breaks an embedded app

Embedded apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `react-router` or `@shopify/polaris`. Do not use `<a>`.
2. Use `redirect` returned from `authenticate.admin`. Do not use `redirect` from `react-router`
3. Use `useSubmit` from `react-router`.

This only applies if your app is embedded, which it will be by default.

### Webhooks: shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.

Instead of using the `afterAuth` hook declare app-specific webhooks in the `shopify.app.toml` file. This approach is easier since Shopify will automatically sync changes every time you run `deploy` (e.g: `npm run deploy`). Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?deliveryMethod=https)

If you do need shop-specific webhooks, keep in mind that the package calls `afterAuth` in 2 scenarios:

- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so shop-specific subscriptions aren't updated. To force your app to update the subscriptions, uninstall and reinstall the app. Revisiting the app will call the `afterAuth` hook.

### Webhooks: Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.

The recommended solution is to use [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) defined in your toml file instead. Test your webhooks by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Webhooks: Admin object undefined on webhook events triggered by the CLI

When you trigger a webhook event using the Shopify CLI, the `admin` object will be `undefined`. This is because the CLI triggers an event with a valid, but non-existent, shop. The `admin` object is only available when the webhook is triggered by a shop that has installed the app. This is expected.

Webhooks triggered by the CLI are intended for initial experimentation testing of your webhook configuration. For more information on how to test your webhooks, see the [Shopify CLI documentation](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

If so, please update [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/.graphqlrc.ts).

### Using Defer & await for streaming responses

By default the CLI uses a cloudflare tunnel. Unfortunately cloudflare tunnels wait for the Response stream to finish, then sends one chunk. This will not affect production.

To test [streaming using await](https://reactrouter.com/api/components/Await#await) during local development we recommend [localhost based development](https://shopify.dev/docs/apps/build/cli-for-apps/networking-options#localhost-based-development).

### "nbf" claim timestamp check failed

This is because a JWT token is expired. If you are consistently getting this error, it could be that the clock on your machine is not in sync with the server. To fix this ensure you have enabled "Set time and date automatically" in the "Date and Time" settings on your computer.

## Resources

React Router:

- [React Router docs](https://reactrouter.com/home)

Shopify:

- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

Internationalization:

- [Internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
