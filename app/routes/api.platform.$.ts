import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { merchantHandler } from "../platform/merchant.server";
import { runtime } from "../platform/runtime.server";
const handle = merchantHandler(runtime);
export const loader = ({ request, params }: LoaderFunctionArgs) =>
  handle(request, params["*"] ?? "");
export const action = ({ request, params }: ActionFunctionArgs) =>
  handle(request, params["*"] ?? "");
