import { useEffect, useState } from "react";
import { merchantContext } from "../platform/merchant";
export default function Home() {
  const [shop, setShop] = useState<string>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    merchantContext()
      .then((value) => {
        if (active) setShop(value.shop);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <s-page heading="Nitrogen">
      <s-section heading="La tua app">
        <s-paragraph>
          {failed
            ? "Accesso non disponibile. Riapri l’app da Shopify Admin o contatta l’assistenza."
            : shop
              ? `Negozio collegato: ${shop}`
              : "Connessione in corso…"}
        </s-paragraph>
        {shop ? <s-link href="/app/billing">Gestisci il piano</s-link> : null}
      </s-section>
    </s-page>
  );
}
