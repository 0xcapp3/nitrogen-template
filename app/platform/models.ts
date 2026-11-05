// Types used by this app. Refer to Platform Swagger when changing API calls.
export type BillingAccess = {
  mode: string;
  reason: string;
  validUntil: string | null;
};
export type BillingCatalog = { plans: Array<BillingPlan>; version: number };
export type BillingCommandResult = {
  confirmationUrl: string | null;
  status: string;
};
export type BillingCommercialUsage = {
  chargedAmount: number;
  committedAmount: number;
  currencyCode: string;
  effectiveCap: number | null;
  extraAmount: number;
  extraCount: bigint;
  included: number;
  includedReserved: bigint;
  queuedAmount: number;
  remaining: number;
};
export type BillingDetails = {
  access: BillingAccess;
  catalog: BillingCatalog;
  mode: string;
  proposal: BillingProposal | null;
  subscription: BillingSubscription;
  usage: BillingCommercialUsage;
  verification: BillingVerification;
};
export type BillingPlan = {
  currencyCode: string;
  displayName: string;
  features: Array<string>;
  free: boolean;
  interval: string;
  planHandle: string;
  price: number | null;
  recommended: boolean;
  selfService: boolean;
  trialDays: number;
  usage: BillingPlanUsage | null;
};
export type BillingPlanUsage = {
  caps: Array<number>;
  defaultCap: number;
  terms: string;
  unitPrice: number;
};
export type BillingProposal = {
  confirmationUrl: string | null;
  createdAt: string;
  id: string;
  planHandle: string | null;
  status: string;
};
export type BillingSubscribe = { planHandle: string };
export type BillingSubscription = {
  currentPeriodEnd: string | null;
  planHandle: string | null;
  status: string;
  test: boolean;
  usage: BillingUsage | null;
};
export type BillingUsage = {
  balanceUsed: number | null;
  cappedAmount: number;
  currencyCode: string;
};
export type BillingVerification = {
  reason: string | null;
  status: string;
  verifiedAt: string | null;
};
export type ShopifyInstallation = {
  activatedAt: string;
  installationId: string;
  schemaVersion: number;
  status: "active";
  storeId: string;
};
export interface AppResponses {
  BillingDetails: BillingDetails;
  BillingCommandResult: BillingCommandResult;
  BillingSubscribe: BillingSubscribe;
  ShopifyInstallation: ShopifyInstallation;
}
export const int64Fields = {
  BillingDetails: ["/usage/extraCount", "/usage/includedReserved"],
  BillingCommandResult: [],
  BillingSubscribe: [],
  ShopifyInstallation: [],
} as const;
