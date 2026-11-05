# Shopify product example (reference only)

These files preserve the upstream 2026-10 product creation, variant price update and Product Event subscription. They are excluded from routing and the active Shopify configuration.

Do not copy the direct Admin authentication into a Nitrogen edge. To make this example executable, first implement dedicated, authorized Platform capabilities for product creation/price updates and signed event ingestion. Platform must own the Admin credentials and all mutation execution. Provision write_products only for the application that opts into those capabilities. There is no active demo endpoint or implicit product permission in this template.
