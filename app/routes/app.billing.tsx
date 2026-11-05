import { useCallback, useEffect, useRef, useState } from "react";
import { capability, merchantContext } from "../platform/merchant";
import type { AppResponses } from "../platform/models";
import { isShopifyConfirmationUrl } from "../billing/confirmation-url";

type Details = AppResponses["BillingDetails"];
function money(value: number | null, currency: string) {
  return value === null
    ? "Su richiesta"
    : new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(
        value,
      );
}
export default function Billing() {
  const [details, setDetails] = useState<Details>();
  const [shop, setShop] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const keys = useRef(new Map<string, string>());
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    const context = await merchantContext();
    const value = await capability("BillingDetails", "refresh", "POST", {});
    setShop(context.shop);
    setDetails(value);
  }, []);
  useEffect(() => {
    Promise.resolve()
      .then(load)
      .catch(() =>
        setError(
          "Piani non disponibili. Verifica l’accesso con l’assistenza e riprova.",
        ),
      );
  }, [load]);
  const refresh = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await load();
    } catch {
      setError("Non è stato possibile aggiornare lo stato del piano.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const command = async (
    operation: "subscribe" | "cancel",
    planHandle?: string,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    const fingerprint = `${operation}:${planHandle ?? ""}`;
    let key = keys.current.get(fingerprint);
    if (!key) {
      key = crypto.randomUUID();
      keys.current.set(fingerprint, key);
    }
    try {
      const result = await capability(
        "BillingCommandResult",
        operation,
        "POST",
        operation === "subscribe" ? { planHandle } : {},
        key,
      );
      if (result.confirmationUrl !== null) {
        if (!isShopifyConfirmationUrl(result.confirmationUrl, shop))
          throw new Error("Invalid confirmation");
        window.open(result.confirmationUrl, "_top");
      }
      keys.current.delete(fingerprint);
      setConfirmCancel(false);
      await load();
    } catch {
      setError(
        "Operazione non confermata. Aggiorna lo stato prima di riprovare; un nuovo tentativo della stessa operazione mantiene la chiave di richiesta.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const disabled =
    busy ||
    !details ||
    details.mode === "simulated" ||
    details.verification.status !== "VERIFIED";
  return (
    <s-page heading="Piani">
      {error ? (
        <s-banner tone="warning" heading="Richiesta non completata">
          <s-paragraph>{error}</s-paragraph>
        </s-banner>
      ) : null}
      <s-button onClick={refresh} disabled={busy}>
        Aggiorna stato
      </s-button>
      {details ? (
        <>
          <s-section heading="Abbonamento">
            <s-paragraph>
              Stato: {details.subscription.status}. Piano:{" "}
              {details.subscription.planHandle ?? "nessuno"}.
            </s-paragraph>
            <s-paragraph>
              Accesso: {details.access.mode}. Verifica:{" "}
              {details.verification.status}.
            </s-paragraph>
            {details.mode === "simulated" ? (
              <s-paragraph>
                Modalità di sviluppo simulata: nessun addebito Shopify.
              </s-paragraph>
            ) : null}
            {details.subscription.test ? (
              <s-badge>Addebito di test</s-badge>
            ) : null}
            {details.proposal ? (
              <s-paragraph>
                Proposta: {details.proposal.planHandle} —{" "}
                {details.proposal.status}
              </s-paragraph>
            ) : null}
            {details.proposal?.status === "PENDING" &&
            isShopifyConfirmationUrl(details.proposal.confirmationUrl, shop) ? (
              <s-button
                disabled={disabled}
                onClick={() =>
                  window.open(details.proposal!.confirmationUrl!, "_top")
                }
              >
                Riprendi approvazione
              </s-button>
            ) : null}
          </s-section>
          {details.catalog.plans.map((plan) => (
            <s-section key={plan.planHandle} heading={plan.displayName}>
              <s-paragraph>
                {money(plan.price, plan.currencyCode)} /{" "}
                {plan.interval === "ANNUAL" ? "anno" : "30 giorni"}
              </s-paragraph>
              {plan.features.map((feature) => (
                <s-paragraph key={feature}>{feature}</s-paragraph>
              ))}
              {plan.usage ? (
                <s-paragraph>
                  {plan.usage.terms} Massimale:{" "}
                  {money(plan.usage.defaultCap, plan.currencyCode)}.
                </s-paragraph>
              ) : null}
              {plan.selfService ? (
                <s-button
                  disabled={
                    disabled ||
                    (details.subscription.status === "ACTIVE" &&
                      details.subscription.planHandle === plan.planHandle)
                  }
                  onClick={() => command("subscribe", plan.planHandle)}
                >
                  Scegli piano
                </s-button>
              ) : (
                <s-paragraph>
                  Contatta l’assistenza per questo piano.
                </s-paragraph>
              )}
            </s-section>
          ))}
          <s-section heading="Consumi">
            <s-paragraph>
              Inclusi: {String(details.usage.included)}. Residui:{" "}
              {String(details.usage.remaining)}. Extra:{" "}
              {String(details.usage.extraCount)}.
            </s-paragraph>
            <s-paragraph>
              Extra maturati:{" "}
              {money(details.usage.extraAmount, details.usage.currencyCode)}.
            </s-paragraph>
          </s-section>
          {["ACTIVE", "FROZEN"].includes(details.subscription.status) ? (
            <s-section heading="Annullamento">
              <s-paragraph>
                L’annullamento interrompe il rinnovo; l’accesso residuo segue le
                condizioni del piano.
              </s-paragraph>
              {confirmCancel ? (
                <>
                  <s-button
                    tone="critical"
                    disabled={disabled}
                    onClick={() => command("cancel")}
                  >
                    Conferma annullamento
                  </s-button>
                  <s-button
                    disabled={busy}
                    onClick={() => setConfirmCancel(false)}
                  >
                    Mantieni piano
                  </s-button>
                </>
              ) : (
                <s-button
                  disabled={disabled}
                  onClick={() => setConfirmCancel(true)}
                >
                  Annulla abbonamento
                </s-button>
              )}
            </s-section>
          ) : null}
        </>
      ) : (
        <s-paragraph>Caricamento piani…</s-paragraph>
      )}
    </s-page>
  );
}
