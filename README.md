# Nitrogen app template

Base React Router 7 per le app Shopify embedded collegate a Nitrogen Platform.
Node 22, Yarn 4 e il toolchain originale restano gestiti da `mise.toml`.

## Responsabilità

Il browser riceve solo la shell pubblica e la chiave pubblica Shopify. App Bridge
fornisce un ID token per ogni richiesta. Le route `/api/platform/*` aggiungono la
credenziale server e chiamano operazioni fisse di Platform. Platform verifica il
token, risolve installazione e store, custodisce le credenziali Shopify e gestisce
billing, persistenza e autorizzazioni. Il template non richiede database, ORM,
Shopify API secret, Admin access token o session storage.

Home mostra lo shop verificato. Piani mostra catalogo, abbonamento, consumi,
proposta e verifica; supporta sottoscrizione, ripresa dell'approvazione Shopify e
annullamento con conferma. I comandi mantengono la chiave di idempotenza durante
un tentativo incerto nella stessa pagina e non vengono ripetuti automaticamente.
Dopo un reload, verificare lo stato prima di inviare un nuovo comando.

I webhook lifecycle, billing e privacy inoltrano i byte originali e gli header
Shopify consentiti. Platform verifica HMAC e risponde 204 solo dopo intake durevole.
L'app non verifica HMAC e non conferma eventi che Platform non ha accettato.

## Creare una nuova app

1. Creare/linkare l'app nel Shopify Dev Dashboard con `mise exec -- yarn config:link`.
   Personalizzare nome, URL e client ID in `shopify.app.toml`. Scopes vuoti sono
   intenzionali: aggiungere solo quelli richiesti dalle capacità dell'app.
2. Registrare su Platform una nuova application key e l'identità Shopify coerente
   (client ID, secret e scopes gestiti sul backend). Provisionare una credenziale
   servizio dedicata e autorizzare le route necessarie nel gateway.
3. Implementare/configurare su Platform la policy merchant di billing per quella
   application key e il relativo catalogo. Senza policy il backend risponde 403;
   il template non concede ruoli né crea automaticamente cataloghi o provisioning.
4. Copiare `.env.example` in `.env` e valorizzare le cinque variabili sotto.
5. `mise exec -- yarn install --immutable`, poi `mise exec -- yarn dev`.
6. Installare l'app su uno shop DEV e completare la checklist in
   [docs/dev-cutover.md](docs/dev-cutover.md).

| Variabile                           | Significato                                               |
| ----------------------------------- | --------------------------------------------------------- |
| `SHOPIFY_API_KEY`                   | Client ID pubblico dell'app                               |
| `SHOPIFY_APP_URL`                   | Origine pubblica HTTPS, aggiornata dal tunnel in sviluppo |
| `NITROGEN_PLATFORM_API_URL`         | Base gateway con `/api/v1`, senza slash finale            |
| `NITROGEN_PLATFORM_APPLICATION_KEY` | Application key registrata su Platform                    |
| `NITROGEN_PLATFORM_SERVICE_TOKEN`   | Credenziale server, 64 caratteri hex minuscoli            |

HTTP è consentito solo per loopback in sviluppo. Riavviare il processo quando
si ruota la credenziale. Non esporre token in Vite, log o variabili client.

## Contratto e controlli

Swagger/OpenAPI mantenuto su Platform è il riferimento delle API. Il template
contiene solo client HTTP e tipi delle operazioni utilizzate; non copia né scarica
lo schema Platform. Aggiornare chiamate e tipi consultando Swagger.
Gli interi int64 utilizzati dal billing sono serializzati senza perdita di precisione.

```sh
mise exec -- yarn check
```

Il comando esegue lint, TypeScript, test e build.
CI controlla Node 22 e 24 senza servizi database. `yarn build` e `yarn start`
producono/servono l'app; il Dockerfile avvia lo stesso server come utente `node`.
L'ambiente runtime deve fornire le variabili sopra. Le configurazioni `.env`
non entrano nell'immagine.

## Estensioni e riferimento upstream

Le personalizzazioni Nitrogen si aggiungono come capacità Platform con route edge
esplicite, validazione e autorizzazione backend. Non accettare dal browser uno
store ID autorevole, URL backend o query Admin arbitrarie.

La demo prodotti originale è conservata in
[examples/shopify-products](examples/shopify-products/README.md), esclusa dal
runtime e dal build. Richiede una capacità Platform dedicata prima di poter essere
reintrodotta. Le API webhook del template, MCH e VTO sono allineate a `2026-10`.
