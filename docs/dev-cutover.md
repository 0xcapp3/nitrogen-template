# Cutover DEV Shopify 2026-10

Questa modifica richiede il passaggio coordinato di Platform e Mobile 0.17.0+1.
Le build Mobile precedenti non sono un requisito di compatibilità. Il codice non
applica automaticamente migrazioni al database e non esegue deploy.

## Ordine operativo

1. Preparare backup DEV, nuova build Mobile e artefatti delle app. Verificare che
   eventuali override `SHOPIFY_ADMIN_API_VERSION` dell'ambiente siano `2026-10`.
2. Fermare i writer Platform, i worker e gli ingressi che mutano pubblicazioni.
3. Eseguire la migrazione offline descritta in Platform
   `docs/shopify-2026-10-cutover.md`: check, salvataggio fingerprint, apply con UUID.
   Se lo schema mobile è ancora storico, eseguire prima la migrazione del formato
   corrente già fornita da Platform. Non trasformare gli archivi originali a mano.
4. Avviare Platform aggiornata, pubblicare le configurazioni Shopify MCH/VTO/template
   su DEV e installare la nuova build Mobile con bootstrap embedded `2026-10`.
5. Riabilitare writer/worker e verificare la checklist. Dopo nuovi dati, il rollback
   offline rifiuta il ripristino automatico: usare il backup coordinato se necessario.

## Verifica manuale finale

- [ ] Template: shell accessibile, nessun dato merchant prima della verifica ID token.
- [ ] Apertura embedded da Shopify, Home con shop corretto, reload e navigazione.
- [ ] Billing: catalogo, stato verificato/non verificato, piano test e modalità simulata.
- [ ] Sottoscrizione: approvazione, rifiuto, ripresa proposta, errore di rete e refresh.
- [ ] Annullamento: conferma esplicita, stato finale e consumi aggiornati.
- [ ] Permessi: token assente/scaduto, app o shop diversi e policy mancante rifiutati.
- [ ] Webhook: install/uninstall, scopes, billing e privacy arrivano a Platform;
      HMAC errato rifiutato e indisponibilità backend produce retry Shopify.
- [ ] MCH/VTO: apertura embedded, funzionalità proprie e billing dopo aggiornamento.
- [ ] Mobile: installazione pulita e upgrade con cache `2026-07`; bootstrap remoto,
      catalogo, ricerca, carrello, checkout, login e Customer Account.
- [ ] Pubblicazione MCH: configVersion cresce, ETag cambia, minimo `0.17.0`,
      draft e vecchio storico conservati; nuova configurazione scaricata da Mobile.
- [ ] Ispezione richieste Shopify: endpoint/header di versione `2026-10`, nessun fallback.

Le prove automatiche usano trasporti simulati e database temporanei. Le operazioni
Shopify reali, gli scope dell'installazione e la configurazione gateway richiedono
questa verifica sull'ambiente DEV.
