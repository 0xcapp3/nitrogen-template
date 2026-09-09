# @shopify/shopify-app-template-react-router

## 2026.09.09

Correzioni emerse rileggendo l'aggiornamento del giorno precedente, piu' l'introduzione dei test.

### Correzioni

- **`GET /auth/login` restituiva `500`.** Eliminando `app/routes/auth.login/route.tsx` il path e' passato allo splat `app/routes/auth.$.tsx`, che chiama `authenticate.admin()`; la libreria riconosce esplicitamente di essere invocata dal `loginPath` configurato (derivato da `authPathPrefix`) e risponde `500` con «please make sure to call shopify.login() from that route instead». Bookmark e link vecchi finivano li'. Aggiunta `app/routes/auth.login.tsx`, un solo loader che reindirizza a `/` preservando la query string: il segmento statico ha precedenza sullo splat, che resta OAuth puro. Verificato sul server compilato: `/auth/login?shop=x` -> `/?shop=x` -> `/app?shop=x`.
- **Admin API da `2025-10` a `2026-04`.** `2025-10` sarebbe uscita dalla finestra di supporto di 12 mesi a ottobre 2026. Il bump tocca tre punti, non due: `app/shopify.server.ts` (config **e** costante esportata), `.graphqlrc.ts` e `shopify.app.toml`. Nessun rischio di build: `app/types` non esiste, il codegen non e' mai stato eseguito e le query sono stringhe non tipizzate.

### Test

Upstream non ha test. Introdotto **Vitest 5** con `vitest.config.ts` separato da `vite.config.ts` (che carica il plugin `reactRouter()`, inutile in test) e due progetti distinti per prerequisiti diversi.

- `yarn test` — unit, nessun prerequisito, dentro `yarn check`. Copre `token-crypto.server.ts` (round-trip, idempotenza, chiave hex e base64, lunghezza errata, fail-closed in produzione, ciphertext manomesso rifiutato da GCM, chiave ruotata, warning una sola volta), la validazione dei domini shop, e la mappatura degli errori di login. Il caching della chiave a livello di modulo e' aggirato con `vi.resetModules()` e import dinamico, senza aggiungere hook di reset al codice di produzione.
- `yarn test:integration` — richiede Docker, **fuori** da `yarn check` perche' committare non deve dipendere dal daemon. Avvia un PostgreSQL usa-e-getta con [testcontainers](https://node.testcontainers.org/) sulla stessa immagine di `compose.yaml`, applica le migration committate in `drizzle/` e usa il driver `postgres-js` reale: copre quindi anche che quelle migration producano uno schema con cui l'adapter funziona, cosa che nulla verificava.

Due modifiche al codice di produzione le hanno resi testabili:

- `DrizzleSessionStorage` accetta il `db` dal costruttore, con default sul singleton. `new DrizzleSessionStorage()` resta invariato in `shopify.server.ts`; i test iniettano un database usa-e-getta invece di dipendere dall'ordine degli import.
- La costruzione delle `domainTransformations` e' uscita da `shopify.server.ts` (che invoca `shopifyApp()` al load, rendendolo non importabile senza environment) verso `app/shopify.domains.ts`. Il test la giudica passandola a `sanitizeShop`/`sanitizeHost` di `@shopify/shopify-api`, cioe' alla libreria che la consuma davvero: **e' il test che avrebbe intercettato `customShopDomains` silenziosamente inerte**, e verifica anche il contrario, che senza transformation il dominio custom viene rifiutato. La forma della regex non e' libera — `getTransformationDomains()` la estrae dal `source` con un pattern preciso, e deviare non lancia: il dominio sparisce dall'allow-list in silenzio.

### Manutenzione

- **`.github/workflows/audit.yml`** chiude il punto cieco creato dagli `ignore` di Dependabot, che sopprimono anche gli update di sicurezza. Non e' pero' un `yarn npm audit` cieco: l'albero porta 26 advisory transitive in tooling di build (`brace-expansion` via minimatch, `browserslist` via babel, `postcss` via vite, `tar` via node-gyp), nessuna nel path di richiesta del server. Un gate su quelle sarebbe rosso per sempre, e un job sempre rosso non lo legge nessuno. `scripts/audit-pinned.mjs` stampa il quadro completo e fallisce **solo** sui pacchetti pinnati. Entrambi i rami verificati.
- Eliminati sette workflow ereditati da upstream e privi di senso in un fork interno: `cla.yml`, `close-waiting-for-response-issues.yml`, i tre `gardener-*`, `remove-labels-on-activity.yml` e `update-javascript-branch.yml` (che girava su pnpm, Node 20.x e flag stile `.eslintrc` per generare un branch inesistente qui). Restano `ci.yml` e `audit.yml`.
- `ci.yml` legge la versione Node da `.nvmrc`, esegue gli integration test dopo un pre-pull dell'immagine del database e con `TESTCONTAINERS_RYUK_DISABLED=true`: testcontainers si concede solo 10s per vedere le porte agganciate, e a cache fredda il pull esaurisce quel budget. Il runner e' effimero, quindi non c'e' nulla da reclamare per Ryuk.
- `.prettierignore`: rimossa la voce `prisma`. `SHOP_CUSTOM_DOMAIN` documentata nel README fra le variabili di produzione.

## 2026.09.08

Aggiornamento dipendenze (fork interno).

- Pin esatto della famiglia React Router a `7.18.2`. La `7.18.3` ha stretto la validazione dell'`Origin` sulle action da host-only a origin completo: sotto `shopify app dev` il TLS termina al tunnel e l'app server vede una richiesta http, quindi `Origin: https://<host>` non combacia piu' e ogni POST torna `400`. Stesso problema in produzione dietro proxy che terminano il TLS, perche' `react-router-serve` non abilita `trust proxy` di Express. Allineato a [Shopify/shopify-app-template-react-router#280](https://github.com/Shopify/shopify-app-template-react-router/pull/280). Il pin va rimosso solo adottando `allowedActionOrigins`, non aspettando una patch: upstream considera il nuovo comportamento corretto.
- Forzato `qs` a `^6.16.0` via `resolutions` (Yarn) e `overrides` (npm) per chiudere [CVE-2026-82562](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) e [CVE-2026-82417](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g), che arrivano in produzione tramite `@react-router/serve` -> `express@4`. Nota: sotto Yarn 4 solo `resolutions` ha effetto, `overrides` viene ignorato — l'intero blocco `overrides` in questo fork e' inerte e serve solo a chi installasse il template con npm. Per la stessa ragione `overrides.p-map` (ereditato da upstream, aggiunto la' per un `ERR_REQUIRE_ESM`) e' rimasto **non** rispecchiato in `resolutions`: forzarlo a `4.x` andrebbe contro il `^7.0.3` richiesto da `@react-router/dev`, quindi sarebbe un peggioramento, non un allineamento.

### Runtime

- Node **24**, con tetto: `engines` a `">=24 <25"`, `Dockerfile` da `node:20-alpine` a `node:24-alpine`, CI ridotta a Node 24 + Yarn 4. Il tetto non e' cautela generica: Corepack e' stato rimosso dalla distribuzione Node in v25 e questo repo non vendorizza alcun release Yarn in `.yarn/releases`, quindi su Node 25+ non esiste `yarn` e il README diventa ineseguibile. Node 24 e' anche l'unica versione che CI e Dockerfile provano davvero. Aggiunti `.nvmrc` (sorgente portabile, letta dalla CI via `node-version-file`) e `mise.toml` (che pinna anche Yarn, aggirando Corepack in locale); `@types/node` riallineato da `26` a `^24.13.3`, perche' descriveva API di un runtime che non gira da nessuna parte. La CI eseguiva ancora `npx prisma generate && npx prisma validate` su un repo senza Prisma e girava `tsc --noEmit` senza il `react-router typegen` che lo precede in locale: ora esegue `yarn check`.

### Stack Shopify v2

- `@shopify/shopify-app-react-router` `1.2.1` -> `2.1.0`, `@shopify/shopify-api` `13.1.0` -> `14.0.1`, `@shopify/shopify-app-session-storage` `5.0.1` -> `6.0.1`, `@shopify/api-codegen-preset` `2.0.1` -> `3.0.0`. Le major di session-storage e codegen-preset sono solo il floor Node 22: nessun cambio di API, quindi `app/db/session.storage.ts` e `.graphqlrc.ts` restano invariati. Anche la rimozione di `subTopic` dai webhook e' un no-op qui, nessuna delle tre route lo usava.
- Rimossa l'intera superficie non-embedded, che v2 non supporta piu': `AppProvider` non accetta piu' `embedded` e richiede sempre `apiKey`. Di conseguenza `app/routes/auth.login/route.tsx` (che usava `<AppProvider embedded={false}>`) e' stata eliminata e il login spostato nella `action` di `app/routes/_index/route.tsx`, dove il form gia' viveva; il form ora posta su se stesso e mostra l'errore inline. `error.server.tsx` si e' spostato di conseguenza. La rotta splat `app/routes/auth.$.tsx` resta: gestisce OAuth, non la UI.
- `customShopDomains` -> `domainTransformations` in `app/shopify.server.ts`. La vecchia chiave era stata rimossa dalla libreria in v1.2.0 ma era rimasta nel codice, quindi `SHOP_CUSTOM_DOMAIN` era **silenziosamente inerte**. Causa: `shopifyApp` e' dichiarata `shopifyApp<Config extends AppConfigArg>(appConfig: Readonly<Config>)`, quindi `Config` viene inferito dall'oggetto passato e TypeScript non fa alcun controllo di proprieta' sconosciute — nessun errore di compilazione, ne' prima ne' ora. La variabile e' ora documentata in `.env.example`.

### Toolchain

- ESLint `8.57.1` (EOL, deprecata) -> `9.39.5` con **flat config**: nuovo `eslint.config.js`, rimossi `.eslintrc.cjs` e `.eslintignore` (v9 non legge piu' quest'ultimo), tolto `--ignore-path .gitignore` dallo script `lint` (opzione rimossa in v9). `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` `6.21.0` sostituiti dal meta-pacchetto `typescript-eslint@8`; aggiunti `@eslint/js` e `globals`; rimosso `@types/eslint`. Le regole sono una traduzione 1:1 della configurazione precedente. Rimossa una direttiva `eslint-disable no-undef` in `app/routes/app.tsx` diventata inutile.
- Non si sale a ESLint 10: `eslint-plugin-import@2.32.0` dichiara peer eslint fino a `^9`.
- Vite `7.3.6` -> `8.2.2`. Vite 8 risolve i `paths` di tsconfig nativamente, quindi **`vite-tsconfig-paths` e' stato rimosso** in favore di `resolve.tsconfigPaths: true`. Resta un warning `envFile is deprecated` che arriva da dentro `@react-router/dev`, non dalla nostra configurazione.
- TypeScript `5.9.3` -> `6.0.3`, `@types/node` `25` -> `26`. TS 6 segnala `baseUrl` come deprecata: era impostata in `tsconfig.json` senza alcun `paths` e nessun import la usava, quindi e' stata rimossa invece che silenziata.
- Non si sale a TypeScript 7: `@react-router/dev` dichiara peer `typescript: ^5.1.0 || ^6.0.0` e `typescript-eslint@8` dichiara `>=4.8.4 <6.1.0`.

### Minor e patch

- `@shopify/app-bridge-react` `^4.2.13`, `@shopify/polaris-types` `1.0.1` (esatta) -> `^1.0.7`, `isbot` `^5.2.2`, `prettier` `^3.9.6`. `dotenv`, `drizzle-orm`, `drizzle-kit`, `postgres`, `graphql-config` e i plugin ESLint erano gia' all'ultima stabile.

### Manutenzione

- `.github/dependabot.yml`: aggiunti gli `ignore` su `react-router` e i quattro `@react-router/*` per `>7.18.2` (con la nota che gli `ignore` valgono anche per gli update di sicurezza), un gruppo `shopify` per i quattro pacchetti accoppiati da peer, un gruppo `eslint` per la flat config, e rimosso il gruppo `prisma` che in questo fork non ha corrispondenza.

### Non aggiornati, volutamente

- **React Router 8** e **React 19**: `@shopify/shopify-app-react-router@2.1.0` dichiara peer `react-router: ^7.6.2`. Finche' non allarga il range, RR8 non e' installabile e React 19 da solo non porta benefici.
- **Drizzle 1.0**: ancora in `rc`.

## 2026.01.08
- [#170](https://github.com/Shopify/shopify-app-template-react-router/pull/170) - Update React Router minimum version to v7.12.0

## 2025.12.11

- [#151](https://github.com/Shopify/shopify-app-template-react-router/pull/151) Update `@shopify/shopify-app-react-router` to v1.1.0 and `@shopify/shopify-app-session-storage-prisma` to v8.0.0, add refresh token fields (`refreshToken` and `refreshTokenExpires`) to Session model in Prisma schema, and adopt the `expiringOfflineAccessTokens` flag for enhanced security through token rotation. See [expiring vs non-expiring offline tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens#expiring-vs-non-expiring-offline-tokens) for more information.

## 2025.10.10

- [#95](https://github.com/Shopify/shopify-app-template-react-router/pull/95) Swap the product link for [admin intents](https://shopify.dev/docs/apps/build/admin/admin-intents).

## 2025.10.02

- [#81](https://github.com/Shopify/shopify-app-template-react-router/pull/81) Add shopify global to eslint for ui extensions

## 2025.10.01

- [#79](https://github.com/Shopify/shopify-app-template-react-router/pull/78) Update API version to 2025-10.
- [#77](https://github.com/Shopify/shopify-app-template-react-router/pull/77) Update `@shopify/shopify-app-react-router` to V1.
- [#73](https://github.com/Shopify/shopify-app-template-react-router/pull/73/files) Rename @shopify/app-bridge-ui-types to @shopify/polaris-types

## 2025.08.30

- [#70](https://github.com/Shopify/shopify-app-template-react-router/pull/70/files) Upgrade `@shopify/app-bridge-ui-types` from 0.2.1 to 0.3.1.

## 2025.08.17

- [#58](https://github.com/Shopify/shopify-app-template-react-router/pull/58) Update Shopify & React Router dependencies.  Use Shopify React Router in graphqlrc, not shopify-api
- [#57](https://github.com/Shopify/shopify-app-template-react-router/pull/57) Update Webhook API version in `shopify.app.toml` to `2025-07`
- [#56](https://github.com/Shopify/shopify-app-template-react-router/pull/56) Remove local CLI from package.json in favor of global CLI installation
- [#53](https://github.com/Shopify/shopify-app-template-react-router/pull/53) Add the Shopify Dev MCP to the template

## 2025.08.16

- [#52](https://github.com/Shopify/shopify-app-template-react-router/pull/52) Use `ApiVersion.July25` rather than `LATEST_API_VERSION` in `.graphqlrc`.

## 2025.07.24

- [14](https://github.com/Shopify/shopify-app-template-react-router/pull/14/files) Add [App Bridge web components](https://shopify.dev/docs/api/app-home/app-bridge-web-components) to the template.

## July 2025

Forked the [shopify-app-template repo](https://github.com/Shopify/shopify-app-template-remix)

# @shopify/shopify-app-template-remix

## 2025.03.18

-[#998](https://github.com/Shopify/shopify-app-template-remix/pull/998) Update to Vite 6

## 2025.03.01

- [#982](https://github.com/Shopify/shopify-app-template-remix/pull/982) Add Shopify Dev Assistant extension to the VSCode extension recommendations

## 2025.01.31

- [#952](https://github.com/Shopify/shopify-app-template-remix/pull/952) Update to Shopify App API v2025-01

## 2025.01.23

- [#923](https://github.com/Shopify/shopify-app-template-remix/pull/923) Update `@shopify/shopify-app-session-storage-prisma` to v6.0.0

## 2025.01.8

- [#923](https://github.com/Shopify/shopify-app-template-remix/pull/923) Enable GraphQL autocomplete for Javascript

## 2024.12.19

- [#904](https://github.com/Shopify/shopify-app-template-remix/pull/904) bump `@shopify/app-bridge-react` to latest
-
## 2024.12.18

- [875](https://github.com/Shopify/shopify-app-template-remix/pull/875) Add Scopes Update Webhook
## 2024.12.05

- [#910](https://github.com/Shopify/shopify-app-template-remix/pull/910) Install `openssl` in Docker image to fix Prisma (see [#25817](https://github.com/prisma/prisma/issues/25817#issuecomment-2538544254))
- [#907](https://github.com/Shopify/shopify-app-template-remix/pull/907) Move `@remix-run/fs-routes` to `dependencies` to fix Docker image build
- [#899](https://github.com/Shopify/shopify-app-template-remix/pull/899) Disable v3_singleFetch flag
- [#898](https://github.com/Shopify/shopify-app-template-remix/pull/898) Enable the `removeRest` future flag so new apps aren't tempted to use the REST Admin API.

## 2024.12.04

- [#891](https://github.com/Shopify/shopify-app-template-remix/pull/891) Enable remix future flags.

## 2024.11.26

- [888](https://github.com/Shopify/shopify-app-template-remix/pull/888) Update restResources version to 2024-10

## 2024.11.06

- [881](https://github.com/Shopify/shopify-app-template-remix/pull/881) Update to the productCreate mutation to use the new ProductCreateInput type

## 2024.10.29

- [876](https://github.com/Shopify/shopify-app-template-remix/pull/876) Update shopify-app-remix to v3.4.0 and shopify-app-session-storage-prisma to v5.1.5

## 2024.10.02

- [863](https://github.com/Shopify/shopify-app-template-remix/pull/863) Update to Shopify App API v2024-10 and shopify-app-remix v3.3.2

## 2024.09.18

- [850](https://github.com/Shopify/shopify-app-template-remix/pull/850) Removed "~" import alias

## 2024.09.17

- [842](https://github.com/Shopify/shopify-app-template-remix/pull/842) Move webhook processing to individual routes

## 2024.08.19

Replaced deprecated `productVariantUpdate` with `productVariantsBulkUpdate`

## v2024.08.06

Allow `SHOP_REDACT` webhook to process without admin context

## v2024.07.16

Started tracking changes and releases using calver
