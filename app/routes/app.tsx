import { Outlet, useLoaderData } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
export const loader = () => ({ apiKey: process.env.SHOPIFY_API_KEY ?? "" });
export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  if (!apiKey) return <p>Application configuration unavailable.</p>;
  return (
    <AppProvider apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/billing">Piani</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}
export function ErrorBoundary() {
  return <p>Richiesta non riuscita. Riapri l’app da Shopify Admin.</p>;
}
