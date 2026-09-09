import { LoginErrorType } from "@shopify/shopify-app-react-router/server";
import { describe, expect, it } from "vitest";

import { loginErrorMessage } from "./error.server";

describe("loginErrorMessage", () => {
  it("asks for a shop domain when none was submitted", () => {
    expect(loginErrorMessage({ shop: LoginErrorType.MissingShop })).toEqual({
      shop: "Please enter your shop domain to log in",
    });
  });

  it("reports an invalid shop domain", () => {
    expect(loginErrorMessage({ shop: LoginErrorType.InvalidShop })).toEqual({
      shop: "Please enter a valid shop domain to log in",
    });
  });

  it("returns no errors on success, which is what `login` yields on a GET with no shop", () => {
    expect(loginErrorMessage({})).toEqual({});
  });
});
