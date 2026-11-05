import { redirect, type LoaderFunctionArgs } from "react-router";
export const loader = ({request}: LoaderFunctionArgs) => { const url = new URL(request.url); if(url.searchParams.has("shop")) return redirect(`/app${url.search}`); return null; };
export default function Index() { return <main><h1>Nitrogen</h1><p>Apri l’app da Shopify Admin.</p></main>; }
