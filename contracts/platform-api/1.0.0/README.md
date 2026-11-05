# Contratto API corrente 1.0.0

Stato: `partial-api-cutover`. Questo bundle copre le operazioni correnti esportate,
non tutte le funzionalità previste dal piano. Non sostituisce ancora i contratti
legacy necessari ai consumer non migrati.

`openapi.json` è generato da Platform; `transport.ts` e `client.ts` costituiscono
il trasporto comune. `provenance.json` registra commit base, digest dei sorgenti
selezionati e degli artefatti. Il commit base non implica che la working tree sia
pulita. `spectral.yaml` verifica versione pubblica, domini, prove di sicurezza,
ProblemDetails e rappresentazione int64.

Dopo `OpenApiExportTests`, eseguire dalla root Platform:

```sh
python3 scripts/export-current-api.py
python3 scripts/export-current-api.py --check
```

Copiare gli artefatti e il manifest nel consumer, senza modifiche locali.
In MCH, `mise exec -- yarn contract:generate` genera tipi e percorsi int64;
`mise exec -- yarn contract:check` verifica digest, generazione e Spectral.
La copia del bundle in VTO e la sua migrazione restano da completare.

Gli int64 sono numeri interi JSON, rappresentati da bigint in TypeScript.
Il codec usa i percorsi derivati dallo schema per decodifica e serializzazione;
non passare questi payload attraverso JSON.parse/JSON.stringify nativi.
Rifiuta stringhe numeriche, duplicati, overflow e numeri interi non sicuri fuori
dai percorsi dichiarati. I validatori runtime adattano lo schema a bigint;
lo schema pubblico continua a descrivere integer/int64.

Il client richiede base con `/api/v1`, credenziale workload server-side e ID
token originale per richiesta. Non ritenta i comandi. Il consumer deve fornire
il validatore della risposta e conservare la chiave di idempotenza.
