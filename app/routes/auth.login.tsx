import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * `/auth/login` no longer renders a login page — the form lives on `/` since
 * @shopify/shopify-app-react-router v2 dropped non-embedded `AppProvider`.
 *
 * This route exists only so the path does not fall through to the `auth.$`
 * splat. That splat calls `authenticate.admin()`, and the library explicitly
 * detects being called from the configured `loginPath` (derived from
 * `authPathPrefix`, so `/auth/login`) and answers with a 500 telling you to
 * call `shopify.login()` instead. Bookmarks and stale links would hit that.
 *
 * A static segment outranks a splat in route matching, so this wins.
 * The query string is preserved: `/auth/login?shop=x` lands on `/?shop=x`,
 * which the `_index` loader forwards to `/app?shop=x`.
 */
export const loader = ({ request }: LoaderFunctionArgs) => {
  throw redirect(`/${new URL(request.url).search}`);
};
