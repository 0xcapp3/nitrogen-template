// Generated from Platform current API; yarn contract:generate.
export type Access = { role: RoleView | null; target: Target };
export type AnalyticsResponse = {
  byGroup: Array<GroupBreakdown>;
  byModel: Array<ModelBreakdown>;
  byStatus: Array<StatusBreakdown>;
  period: "day" | "week" | "month";
  recent: Array<RecentSession>;
  storeId: string;
  topProducts: Array<TopProduct>;
  totals: Totals;
};
export type ApiProblem = {
  code: string;
  correlationId: string;
  detail: string;
  fieldErrors: Array<ApiProblemFieldError>;
  instance: string;
  retryable: boolean;
  status: number;
  title: string;
  type: string;
};
export type ApiProblemFieldError = {
  code: string;
  message: string;
  path: string;
};
export type AppUi = {
  defaultLocale: "it" | "en";
  supportedLocales: Array<"it" | "en">;
};
export type AssignGarmentTypeRequest = {
  action_run_id: string;
  handle?: string;
  properties: Properties;
  shopify_domain: string;
};
export type AssignGarmentTypeResponse = {
  garment_type?: string;
  group_id?: string;
  reason?: string;
  success?: boolean;
};
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
export type Buyer = { capabilitiesSource?: string };
export type Cart = { complementary: Discovery };
export type Catalog = { showCollections: boolean };
export type Collection = { showDescription: boolean };
export type Commerce = {
  cart?: Cart;
  catalog: Catalog;
  collection: Collection;
  layout?: CommerceLayout;
  merchandising?: Merchandising;
  product: Product;
};
export type CommerceAppearance = {
  cartPreset?: "compact" | "spacious";
  catalogPreset?: "balancedGrid" | "editorialGrid";
  productCardPreset?: "minimal" | "editorial";
  productDetailPreset?: "standard" | "storytelling";
};
export type CommerceLayout = {
  cartAfter: Array<CommerceSection>;
  collectionAfter: Array<CommerceSection>;
  collectionBefore: Array<CommerceSection>;
  productAfter: Array<CommerceSection>;
  productBefore: Array<CommerceSection>;
};
export type CommerceSection = {
  id: string;
  properties?: HomeProperties;
  type: string;
  visible: boolean;
};
export type CompleteTheLook = { looks: Array<Look> };
export type CustomerAccount = {
  callbackUri?: string;
  clientId?: string;
  enabled?: boolean;
};
export type Discovery = { enabled: boolean; maxProducts: number };
export type GarmentGroupDto = {
  active: boolean;
  aspectRatio: string;
  garmentType: string;
  id: string;
  name: string;
};
export type GroupBreakdown = {
  count: bigint;
  groupId: string | null;
  groupName: string | null;
};
export type Home = { sections: Array<Section> };
export type HomeAction = {
  destination: string;
  label: Record<string, string>;
  pageId?: string;
  resourceId?: string;
  url?: string;
};
export type HomeImage = {
  alt?: Record<string, string>;
  height?: number;
  mediaId: string;
  url?: string;
  width?: number;
};
export type HomeProperties = {
  action?: HomeAction;
  alignment?: string;
  content?: Record<string, Array<TextParagraph>>;
  groupId?: string;
  image?: HomeImage;
  size?: string;
  text?: Record<string, string>;
  title?: Record<string, string>;
};
export type Localization = { appUi?: AppUi; buyer?: Buyer };
export type Look = {
  enabled: boolean;
  productId: string;
  productIds: Array<string>;
};
export type MenuItem = {
  destination: "home" | "catalog" | "search" | "cart" | "account";
  icon: "home" | "catalog" | "search" | "cart" | "account";
  labels: Record<string, string>;
  visible: boolean;
};
export type Merchandising = { groups: Array<MerchandisingGroup> };
export type MerchandisingGroup = {
  enabled: boolean;
  id: string;
  kind: string;
  placements: Array<string>;
  productIds: Array<string>;
  sourceId?: string;
  sourceType: string;
  title: Record<string, string>;
};
export type MobileAccount = {
  allowedOperations: Array<
    "mobile.customer-account.read" | "mobile.customer-account.write"
  >;
  buildClientId: string | null;
  buildMatched: boolean;
  callbackUri: string | null;
  clientId: string | null;
  loginVerified: boolean;
  revision: bigint;
  status: "not-configured" | "configured" | "verified" | "disabled" | "error";
  tenantKey: string;
  verifiedAt: string | null;
};
export type MobileAccountConfiguration = {
  account: MobileAccount;
  storeCredit: MobileStoreCreditReadiness;
};
export type MobileAccountConfigure = {
  clientId: string;
  expectedRevision: bigint;
};
export type MobileAccountDisable = { expectedRevision: bigint };
export type MobileAccountMutation = {
  account: MobileAccount;
  changed: boolean;
  operationId: string;
};
export type MobileAppearance = {
  commerceAppearance: CommerceAppearance;
  displayName: string;
  theme: Theme;
};
export type MobileBuildArtifact = {
  applicationId: string;
  buildNumber: string;
  platform: "ios" | "android";
  recordedAt: string;
  sha256: string;
  version: string;
};
export type MobileCampaignAction = { expectedRevision: bigint };
export type MobileCampaignAudience = {
  countries: Array<string>;
  languages: Array<string>;
  platforms: Array<"ios" | "android">;
};
export type MobileCampaignContent = {
  audience: MobileCampaignAudience;
  description: string;
  destination: MobileCampaignDestination;
  imageUrl?: string | null;
  language: string;
  priority: "normal" | "high";
  title: string;
  ttlSeconds: number;
};
export type MobileCampaignCreate = {
  campaignId: string;
  content: MobileCampaignContent;
  environment: "dev" | "staging" | "production";
};
export type MobileCampaignDestination = {
  resourceId?: string | null;
  type:
    "home" | "product" | "collection" | "cart" | "page" | "news" | "account";
};
export type MobileCampaignPair = {
  code: string;
  environment: "dev" | "staging" | "production";
  label: string;
};
export type MobileCampaignSchedule = {
  expectedRevision: bigint;
  localDateTime: string;
  offset?: string | null;
  timezone: string;
};
export type MobileCampaignSchedulePreview = {
  localDateTime: string;
  offset?: string | null;
  timezone: string;
};
export type MobileCampaignTest = {
  expectedRevision: bigint;
  testDevice: string;
};
export type MobileCampaignUpdate = {
  content: MobileCampaignContent;
  expectedRevision: bigint;
};
export type MobileCapabilityStatus = {
  action: string;
  id: string;
  reason: string;
  responsible: string;
  state: string;
  verifiedAt: string | null;
};
export type MobileCheckoutAccess = { allowed: boolean };
export type MobileCommandCompleted = { completed: boolean };
export type MobileCommerceCartInput = {
  complementary: MobileCommerceDiscoveryInput;
};
export type MobileCommerceCatalogInput = { showCollections: boolean };
export type MobileCommerceCollectionInput = { showDescription: boolean };
export type MobileCommerceDiscoveryInput = {
  enabled: boolean;
  maxProducts: number;
};
export type MobileCommerceDraft = {
  commerce: Commerce;
  revision: bigint;
  tenantKey: string;
};
export type MobileCommerceInput = {
  cart: MobileCommerceCartInput;
  catalog: MobileCommerceCatalogInput;
  collection: MobileCommerceCollectionInput;
  layout?: MobileCommerceLayoutInput;
  product: MobileCommerceProductInput;
};
export type MobileCommerceLayoutInput = {
  cartAfter: Array<MobileCommerceSectionInput>;
  collectionAfter: Array<MobileCommerceSectionInput>;
  collectionBefore: Array<MobileCommerceSectionInput>;
  productAfter: Array<MobileCommerceSectionInput>;
  productBefore: Array<MobileCommerceSectionInput>;
};
export type MobileCommerceProductInput = {
  recentlyViewed: MobileCommerceDiscoveryInput;
  recommendations: MobileCommerceDiscoveryInput;
  showDescription: boolean;
  showVendor: boolean;
};
export type MobileCommerceSectionInput = {
  id: string;
  properties?: MobileHomePropertiesInput;
  type:
    | "description"
    | "complete-the-look"
    | "recommendations"
    | "recently-viewed"
    | "complementary"
    | "upsell"
    | "cross-sell"
    | "rich-text"
    | "promo-banner";
  visible: boolean;
};
export type MobileCommerceUpdate = {
  commerce: MobileCommerceInput;
  expectedRevision: bigint;
};
export type MobileCurrentPublication = {
  configVersion: bigint;
  content: MobilePublicationContentDto;
  etag: string;
  publishedAt: string;
  revision: bigint;
  tenantKey: string;
};
export type MobileDeviceCart = { cartToken: string };
export type MobileDeviceEndpoint = { generation: bigint; token: string };
export type MobileDeviceEnrolment = { challenge: string };
export type MobileDeviceEvent = {
  appVersion: string;
  buildNumber: bigint;
  configVersion: bigint;
  eventId: string;
  occurredAt: string;
  properties: Record<string, unknown>;
  schemaVersion: number;
  type:
    | "app_open"
    | "session"
    | "screen_view"
    | "product_view"
    | "collection_view"
    | "search"
    | "cart_add"
    | "cart_remove"
    | "checkout_started"
    | "deep_link_opened";
};
export type MobileDeviceEvents = {
  consentVersion: bigint;
  events: Array<MobileDeviceEvent>;
};
export type MobileDeviceFlowPreferences = {
  context: string;
  personalized: boolean;
  version: bigint;
};
export type MobileDeviceMeasurementPreferences = {
  analytics: boolean;
  firebaseInstanceId?: string | null;
  version: bigint;
};
export type MobileDevicePreview = {
  digest: string;
  environment: string;
  expiresAt: string;
  mobileGitRevision: string;
  sequence: bigint;
  sessionId: string;
  snapshot: MobilePreviewSnapshot;
  sourceRevision: bigint;
  tenantKey: string;
  token: string | null;
};
export type MobileDeviceProof = { generation: bigint; nonce: string };
export type MobileDevicePushPreferences = {
  country?: string | null;
  enabled: boolean;
  language: string;
  permission:
    "not-determined" | "denied" | "authorized" | "provisional" | "unavailable";
  version: bigint;
};
export type MobileDeviceReceipt = {
  deliveryId: string;
  occurredAt: string;
  proof: string;
  type: "received" | "opened";
};
export type MobileDeviceRegistration = {
  buildRef: string;
  environment: "dev" | "staging" | "production";
  platform: "ios" | "android";
};
export type MobileDeviceReset = { context: string };
export type MobileDeviceSignal = {
  context: string;
  id: string;
  marker?: string | null;
  occurredAt: string;
  sequence: bigint;
  type: "activity" | "cart" | "cart-empty" | "checkout" | "checkout-unknown";
};
export type MobileDeviceSignals = {
  preferenceVersion: bigint;
  signals: Array<MobileDeviceSignal>;
};
export type MobileDraft = {
  draft: MobileAppearance;
  revision: bigint;
  tenantKey: string;
};
export type MobileDraftApply = { expectedRevision: bigint };
export type MobileDraftChanges = {
  commerceAppearance?: MobileDraftCommerceAppearancePatch;
  displayName?: string;
  theme?: MobileDraftThemePatch;
};
export type MobileDraftCommerceAppearancePatch = {
  cartPreset?: "compact" | "spacious" | null;
  catalogPreset?: "balancedGrid" | "editorialGrid" | null;
  productCardPreset?: "minimal" | "editorial" | null;
  productDetailPreset?: "standard" | "storytelling" | null;
};
export type MobileDraftMutation = {
  changed: boolean;
  operationId: string;
  revision: bigint;
  tenantKey: string;
};
export type MobileDraftPalette = {
  background: string;
  border: string;
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
};
export type MobileDraftPublish = { expectedRevision: bigint };
export type MobileDraftPublished = {
  changed: boolean;
  operationId: string;
  publication: MobilePublicationSummary;
  publishedRevision: bigint;
  revision: bigint;
  tenantKey: string;
};
export type MobileDraftThemePatch = {
  buttonPreset?: "solid" | "editorial" | null;
  cardPreset?: "outlined" | "elevated" | null;
  darkPalette?: MobileDraftPalette | null;
  fontSet?: "inter" | null;
  hapticPreset?: "subtle" | null;
  iconSet?: "forui" | null;
  inputPreset?: "filled" | "underlined" | null;
  lightPalette?: MobileDraftPalette | null;
  mode?: "system" | "light" | "dark";
  motionPreset?: "standard" | "deliberate" | null;
  navigationPreset?: "compact" | "editorial" | null;
  preset?: "minimal" | "editorial";
  radiusPreset?: "soft" | "sharp" | null;
  shadowPreset?: "flat" | "lifted" | null;
  skeletonPreset?: "soft" | "crisp" | null;
  spacingPreset?: "comfortable" | "editorial" | null;
};
export type MobileDraftUpdate = {
  changes: MobileDraftChanges;
  expectedRevision: bigint;
};
export type MobileEditorialBlog = { id: string; title: string };
export type MobileEditorialBlogs = {
  items: Array<MobileEditorialBlog>;
  nextCursor: string | null;
  tenantKey: string;
};
export type MobileEditorialImage = {
  alt: string | null;
  height: number;
  id: string;
  url: string;
  width: number;
};
export type MobileEditorialImages = {
  items: Array<MobileEditorialImage>;
  nextCursor: string | null;
  tenantKey: string;
};
export type MobileEditorialSummary = {
  displayName: string;
  theme: MobileThemeSummary;
};
export type MobileEngagementAudience = {
  countries: Array<string>;
  languages: Array<string>;
  platforms: Array<string>;
};
export type MobileEngagementCampaign = {
  accepted: bigint;
  content: MobileEngagementContent;
  createdAt: string;
  environment: string;
  failed: bigint;
  id: string;
  opened: bigint;
  received: bigint;
  revision: bigint;
  scheduledAt: string | null;
  selected: bigint;
  state: string;
  suppressed: bigint;
  test: boolean;
  timezone: string | null;
  uncertain: bigint;
};
export type MobileEngagementCampaignDetail = {
  campaign: MobileEngagementCampaign;
  destination: MobileEngagementDestinationSummary;
};
export type MobileEngagementCampaignPage = {
  items: Array<MobileEngagementCampaign>;
  page: number;
  pageSize: number;
  total: bigint;
};
export type MobileEngagementContent = {
  audience: MobileEngagementAudience;
  description: string;
  destination: MobileEngagementDestination;
  imageUrl: string | null;
  language: string;
  priority: string;
  title: string;
  ttlSeconds: number;
};
export type MobileEngagementDestination = {
  resourceId: string | null;
  type: string;
};
export type MobileEngagementDestinationSummary = {
  resourceId: string | null;
  status: string;
  title: string | null;
  type: string;
};
export type MobileEngagementDevice = {
  enabled: boolean;
  id: string;
  label: string;
  observedAt: string;
  permission: string;
  platform: string;
  verified: boolean;
};
export type MobileEngagementEstimate = {
  eligible: bigint;
  evaluatedAt: string;
};
export type MobileEngagementSchedulePreview = { scheduledAt: string };
export type MobileFavorite = {
  content: MobilePublicationContentDto;
  metadata: MobileFavoriteMetadata;
};
export type MobileFavoriteDelete = { expectedRevision: bigint };
export type MobileFavoriteMetadata = {
  createdAt: string;
  id: string;
  name: string;
  revision: bigint;
  updatedAt: string;
};
export type MobileFavoriteMutation = {
  changed: boolean;
  draftRevision: bigint;
  id: string;
  revision: bigint;
};
export type MobileFavoritePage = {
  entries: Array<MobileFavoriteMetadata>;
  nextCursor: string | null;
};
export type MobileFavoriteRename = { expectedRevision: bigint; name: string };
export type MobileFavoriteSave = { expectedRevision: bigint; name: string };
export type MobileFlowAction = {
  environment: "dev" | "staging" | "production";
  expectedRevision: bigint;
};
export type MobileFlowCreate = {
  definition: MobileFlowDefinitionInput;
  environment: "dev" | "staging" | "production";
  flowId: string;
};
export type MobileFlowDefinition = {
  audience: MobileEngagementAudience;
  name: string;
  steps: Array<MobileFlowStep>;
  template: string;
};
export type MobileFlowDefinitionInput = {
  audience: MobileCampaignAudience;
  name: string;
  steps: Array<MobileFlowStepInput>;
  template:
    | "welcome"
    | "abandoned-cart"
    | "abandoned-checkout"
    | "churn"
    | "post-purchase";
};
export type MobileFlowDetail = {
  destinations: Array<MobileEngagementDestinationSummary>;
  flow: MobileFlowFlow;
  validation: MobileFlowValidation;
};
export type MobileFlowDevicePolicy = {
  context: string;
  expiresAt: string;
  personalized: boolean;
  schemaVersion: number;
  supported: boolean;
  version: bigint;
};
export type MobileFlowFlow = {
  activeVersion: bigint | null;
  createdAt: string;
  draft: MobileFlowDefinition;
  environment: string;
  id: string;
  revision: bigint;
  state: string;
};
export type MobileFlowInstance = {
  checkpoint: number;
  dueAt: string | null;
  id: string;
  reason: string | null;
  startedAt: string;
  state: string;
  version: bigint;
};
export type MobileFlowInstances = {
  items: Array<MobileFlowInstance>;
  page: number;
  pageSize: number;
  total: bigint;
};
export type MobileFlowMoney = {
  currency: string;
  orders: bigint;
  refunded: string;
  total: string;
};
export type MobileFlowPage = {
  items: Array<MobileFlowFlow>;
  page: number;
  pageSize: number;
  permissions: Array<string>;
  total: bigint;
};
export type MobileFlowReport = {
  accepted: bigint;
  attributed: Array<MobileFlowMoney>;
  attributionRule: string;
  completed: bigint;
  coverage: string;
  coverageFrom: string | null;
  coverageTo: string | null;
  ctr: number | null;
  eligible: bigint;
  failed: bigint;
  opened: bigint;
  ordersAvailable: boolean;
  received: bigint;
  started: bigint;
  stopped: bigint;
  suppressed: bigint;
  timezone: string;
  uncertain: bigint;
};
export type MobileFlowStep = {
  delaySeconds: bigint;
  messages: Array<MobileEngagementContent>;
};
export type MobileFlowStepInput = {
  delaySeconds: bigint;
  messages: Array<MobileCampaignContent>;
};
export type MobileFlowUpdate = {
  definition: MobileFlowDefinitionInput;
  environment: "dev" | "staging" | "production";
  expectedRevision: bigint;
};
export type MobileFlowValidation = {
  durationSeconds: bigint;
  eligible: bigint;
  ready: boolean;
  reasons: Array<string>;
};
export type MobileHistoryApplyResult = {
  changed: boolean;
  configVersion: bigint | null;
  operationId: string;
  revision: bigint;
  sourceVersion: bigint;
  tenantKey: string;
};
export type MobileHistoryDetail = {
  currentConfigVersion: bigint | null;
  entry: MobileHistoryEntry;
  revision: bigint;
  tenantKey: string;
};
export type MobileHistoryEntry = {
  content: MobilePublicationContentDto | null;
  publication: MobileHistorySummary;
};
export type MobileHistoryPage = {
  allowedOperations: Array<string>;
  currentConfigVersion: bigint | null;
  entries: Array<MobileHistorySummary>;
  nextCursor: string | null;
  revision: bigint;
  tenantKey: string;
};
export type MobileHistorySummary = {
  applicable: boolean;
  configVersion: bigint;
  designSystemVersion: number;
  displayName: string;
  etag: string;
  minimumAppVersion: string;
  origin: string;
  publishedAt: string;
  restoredFromVersion: bigint | null;
  schemaVersion: number;
  themeMode: string;
};
export type MobileHomeActionInput = {
  destination:
    | "catalog"
    | "search"
    | "cart"
    | "account"
    | "news"
    | "web"
    | "page"
    | "product"
    | "collection";
  label: Record<string, string>;
  pageId?: string;
  resourceId?: string;
  url?: string;
};
export type MobileHomeDraft = {
  destinations: Array<string>;
  home: Home;
  locales: AppUi;
  pages: Array<MobilePageTarget>;
  revision: bigint;
  tenantKey: string;
};
export type MobileHomeImageInput = {
  alt?: Record<string, string>;
  height?: number;
  mediaId: string;
  url?: string;
  width?: number;
};
export type MobileHomeInput = { sections: Array<MobileHomeSectionInput> };
export type MobileHomePropertiesInput = {
  action?: MobileHomeActionInput;
  alignment?: "start" | "center" | "end";
  content?: Record<string, Array<MobileTextParagraphInput>>;
  groupId?: string;
  image?: MobileHomeImageInput;
  size?: "small" | "medium" | "large";
  text?: Record<string, string>;
  title?: Record<string, string>;
};
export type MobileHomeSectionInput = {
  id: string;
  properties?: MobileHomePropertiesInput;
  type:
    | "hero"
    | "promo-banner"
    | "rich-text"
    | "button"
    | "spacer"
    | "divider"
    | "collection-carousel"
    | "product-grid"
    | "category-grid"
    | "merchandising";
  version?: number;
  visible?: boolean;
};
export type MobileHomeUpdate = {
  expectedRevision: bigint;
  home: MobileHomeInput;
};
export type MobileInstallationIdentity = { installationId: string };
export type MobileLookInput = {
  enabled: boolean;
  productId: string;
  productIds: Array<string>;
};
export type MobileLookProduct = {
  id: string;
  imageUrl: string | null;
  status: string;
  title: string;
};
export type MobileLooksDraft = {
  catalogAvailable: boolean;
  completeTheLook: CompleteTheLook;
  locales: AppUi;
  products: Array<MobileLookProduct>;
  revision: bigint;
  tenantKey: string;
};
export type MobileLooksInput = { looks: Array<MobileLookInput> };
export type MobileLooksUpdate = {
  completeTheLook: MobileLooksInput;
  expectedRevision: bigint;
};
export type MobileMarketsCountry = {
  availableLanguages: Array<MobileMarketsLanguage>;
  code: string;
  currencyCode: string;
  defaultLanguage: MobileMarketsLanguage;
  name: string;
};
export type MobileMarketsLanguage = { code: string; name: string };
export type MobileMarketsView = {
  countries: Array<MobileMarketsCountry>;
  tenantKey: string;
};
export type MobileMeasurementAccepted = {
  accepted: number;
  duplicates: number;
};
export type MobileMeasurementBuild = {
  buildRef: string;
  disabled: boolean;
  environment: string;
  evidenceRef: string | null;
  firebaseAppId: string;
  platform: string;
  projectId: string;
  streamId: string;
  verifiedAt: string | null;
};
export type MobileMeasurementCartCorrelation = {
  attributeKey: string;
  attributeValue: string;
  expiresAt: string;
};
export type MobileMeasurementChallenge = {
  challenge: string;
  expiresAt: string;
};
export type MobileMeasurementCoverage = {
  from: string | null;
  fullHistory: boolean;
  reason: string | null;
  state: string;
  to: string | null;
  updatedAt: string | null;
};
export type MobileMeasurementCredential = {
  credential: string;
  expiresAt: string;
  installationRef: string;
};
export type MobileMeasurementCurrencyReport = {
  appAov: MobileMeasurementMetric;
  appOrders: MobileMeasurementMetric;
  appRetention90: MobileMeasurementMetric;
  appSales: MobileMeasurementMetric;
  appShare: MobileMeasurementMetric;
  currency: string;
  daily: Array<MobileMeasurementDaily>;
  monthlyProjection: MobileMeasurementMetric;
  shopRetention90: MobileMeasurementMetric;
};
export type MobileMeasurementDaily = {
  appOrders: bigint;
  appSales: number;
  date: string;
  shopSales: number;
};
export type MobileMeasurementMetric = {
  reason: string | null;
  state: string;
  value: number | null;
};
export type MobileMeasurementPolicy = {
  enabled: boolean;
  events: Array<string>;
  projectId: string | null;
};
export type MobileMeasurementPolicyInput = {
  enabled: boolean;
  events: Array<
    | "app_open"
    | "session"
    | "screen_view"
    | "product_view"
    | "collection_view"
    | "search"
    | "cart_add"
    | "cart_remove"
    | "checkout_started"
    | "deep_link_opened"
  >;
  projectId?: string | null;
};
export type MobileMeasurementReport = {
  coverage: MobileMeasurementCoverage;
  currencies: Array<MobileMeasurementCurrencyReport>;
  environment: string;
  from: string;
  metricVersion: string;
  pushState: string;
  schemaVersion: number;
  tenantKey: string;
  through: string;
  timezone: string;
};
export type MobileMeasurementRuntimePolicy = {
  analyticsConsent: boolean;
  configVersion: bigint;
  consentVersion: bigint;
  firebaseAppId: string | null;
  policy: MobileMeasurementPolicy;
  ready: boolean;
  validUntil: string;
};
export type MobileMeasurementSettings = {
  builds: Array<MobileMeasurementBuild>;
  currentBuildRef: string | null;
  draft: MobileMeasurementPolicy;
  permissions: Array<string>;
  published: MobileMeasurementPolicy;
  readinessReason: string | null;
  revision: bigint;
  state: string;
  tenantKey: string;
  verifications: Array<MobileMeasurementVerification>;
};
export type MobileMeasurementUpdate = {
  expectedRevision: bigint;
  policy: MobileMeasurementPolicyInput;
};
export type MobileMeasurementVerification = {
  buildRef: string;
  environment: string;
  platform: string;
  sourceBuildRef: string | null;
  state: string;
};
export type MobileMenuItemInput = {
  destination: "home" | "catalog" | "search" | "cart" | "account";
  icon: "home" | "catalog" | "search" | "cart" | "account";
  labels: Record<string, string>;
  visible: boolean;
};
export type MobileMerchandisingDraft = {
  catalogAvailable: boolean;
  locales: AppUi;
  merchandising: Merchandising;
  products: Array<MobileMerchandisingProduct>;
  revision: bigint;
  tenantKey: string;
};
export type MobileMerchandisingGroupInput = {
  enabled: boolean;
  id: string;
  kind: "upsell" | "cross-sell";
  placements: Array<"product" | "cart" | "after-add" | "home" | "collection">;
  productIds: Array<string>;
  sourceId?: string;
  sourceType: "product" | "collection" | "home";
  title: Record<string, string>;
};
export type MobileMerchandisingInput = {
  groups: Array<MobileMerchandisingGroupInput>;
};
export type MobileMerchandisingProduct = {
  id: string;
  imageUrl: string | null;
  status: string;
  title: string;
};
export type MobileMerchandisingUpdate = {
  expectedRevision: bigint;
  merchandising: MobileMerchandisingInput;
};
export type MobileNavigationDraft = {
  destinations: Array<"home" | "catalog" | "search" | "cart" | "account">;
  menu: Array<MenuItem>;
  revision: bigint;
  tenantKey: string;
};
export type MobileNavigationUpdate = {
  expectedRevision: bigint;
  menu: Array<MobileMenuItemInput>;
};
export type MobileNewsDraft = {
  locales: AppUi;
  news: News;
  revision: bigint;
  tenantKey: string;
};
export type MobileNewsInput = {
  blogId?: string;
  enabled: boolean;
  title: Record<string, string>;
};
export type MobileNewsUpdate = {
  expectedRevision: bigint;
  news: MobileNewsInput;
};
export type MobileOnboarding = {
  activatedAt: string;
  build: MobileOnboardingBuild | null;
  installationId: string;
  schemaVersion: number;
  state: "initialization-required" | "recovery-required" | "ready" | "blocked";
  steps: Array<MobileOnboardingStep>;
  tenantKey: string | null;
};
export type MobileOnboardingBuild = {
  manifestSha256: string;
  minimumAppVersion: string;
  mobileGitRevision: string;
  shopLoginVerified: boolean;
  shopLoginVerifiedAt: string | null;
};
export type MobileOnboardingStep = {
  action: "initialize" | "recover" | "builder" | "account" | "refresh" | "none";
  id: "installation" | "access" | "configuration" | "build" | "shop-login";
  reason:
    | "connected"
    | "access-ready"
    | "owner-required"
    | "recovery-required"
    | "access-blocked"
    | "access-required"
    | "configuration-missing"
    | "draft-available"
    | "build-missing"
    | "build-registered"
    | "shop-verified"
    | "guest-account-optional"
    | "shop-error"
    | "shop-verification-required";
  required: boolean;
  responsible: "merchant" | "nitrogen" | "none";
  status:
    | "completed"
    | "pending"
    | "waiting"
    | "not-applicable"
    | "recoverable-error";
};
export type MobileOperationsView = {
  artifacts: Array<MobileBuildArtifact>;
  capabilities: Array<MobileCapabilityStatus>;
  configSchema: number | null;
  configVersion: bigint | null;
  environment: "dev" | "staging" | "production";
  minimumAppVersion: string | null;
  mobileGitRevision: string | null;
  observedAt: string;
  schemaVersion: number;
  tenantKey: string;
};
export type MobileOverview = {
  allowedOperations: Array<
    | "mobile.overview.read"
    | "mobile.draft.read"
    | "mobile.draft.write"
    | "mobile.publish"
  >;
  blockers: Array<
    | "tenant_not_provisioned"
    | "draft_missing"
    | "installation_unavailable"
    | "tenant_disabled"
    | "build_provenance_missing"
  >;
  customerAccountState:
    "not-configured" | "configured" | "verified" | "disabled" | "error";
  draft: MobileEditorialSummary | null;
  installationState: "available" | "unavailable";
  publication: MobilePublicationSummary | null;
  revision: bigint | null;
  tenantKey: string | null;
  tenantState: "not-provisioned" | "draft" | "published" | "disabled";
};
export type MobileOwnerInitialization = {
  activatedAt: string;
  installationId: string;
};
export type MobilePageInput = {
  content?: MobileHomeInput;
  icon: "file-text" | "info" | "phone" | "link";
  id: string;
  title: Record<string, string>;
  type: "custom" | "external";
  url?: string;
  visible: boolean;
};
export type MobilePageTarget = {
  id: string;
  title: Record<string, string>;
  visible: boolean;
};
export type MobilePagesDraft = {
  destinations: Array<string>;
  locales: AppUi;
  pages: Array<Page>;
  revision: bigint;
  tenantKey: string;
};
export type MobilePagesUpdate = {
  expectedRevision: bigint;
  pages: Array<MobilePageInput>;
};
export type MobilePreviewPair = {
  challenge: string;
  code: string;
  environment: "dev";
  mobileGitRevision: string;
  tenantKey: string;
};
export type MobilePreviewRefresh = {
  expectedRevision: bigint;
  expectedSequence: bigint;
};
export type MobilePreviewRevoke = { expectedSequence: bigint };
export type MobilePreviewSnapshot = {
  commerceAppearance: CommerceAppearance;
  destinations: Array<string>;
  displayName: string;
  home: Home;
  locales: AppUi;
  pageIds: Array<string>;
  schemaVersion: number;
  theme: Theme;
};
export type MobilePreviewStart = { expectedRevision: bigint };
export type MobilePrivatePreview = {
  available: boolean;
  code: string | null;
  digest: string | null;
  expiresAt: string | null;
  mobileGitRevision: string | null;
  pairingExpiresAt: string | null;
  sequence: bigint | null;
  sessionId: string | null;
  sourceRevision: bigint | null;
  status: "none" | "pairing" | "active" | "expired" | "revoked";
  tenantKey: string;
};
export type MobileProfileDraft = {
  locales: AppUi;
  profile: ProfilePresentation;
  revision: bigint;
  tenantKey: string;
};
export type MobileProfileInput = {
  introduction: Record<string, string>;
  sections: Array<MobileProfileSectionInput>;
};
export type MobileProfileSectionInput = {
  id: "orders" | "addresses" | "store_credit";
  visible: boolean;
};
export type MobileProfileUpdate = {
  expectedRevision: bigint;
  profile: MobileProfileInput;
};
export type MobilePublicationContentDto = {
  analytics?: MobileMeasurementPolicy;
  commerce?: Commerce;
  commerceAppearance: CommerceAppearance;
  completeTheLook?: CompleteTheLook;
  displayName: string;
  home: Home;
  localization: Localization;
  navigation: Navigation;
  news?: News;
  pages?: Array<Page>;
  profile?: ProfilePresentation;
  push?: MobilePushPolicy;
  theme: Theme;
};
export type MobilePublicationSummary = {
  applicationState: "not-observed";
  configVersion: bigint;
  etag: string;
  publishedAt: string;
  theme: MobileThemeSummary;
};
export type MobilePushBinding = {
  apnsEnvironment: string | null;
  buildRef: string;
  environment: string;
  platform: string;
  projectId: string | null;
  state: string;
  topic: string | null;
};
export type MobilePushPairing = { code: string; expiresAt: string };
export type MobilePushPolicy = {
  enabled: boolean;
  explanation: Record<string, MobilePushPrompt>;
  explanationEnabled: boolean;
};
export type MobilePushPolicyInput = {
  enabled: boolean;
  explanation: Record<string, MobilePushPromptInput>;
  explanationEnabled: boolean;
};
export type MobilePushPrompt = { description: string; title: string };
export type MobilePushPromptInput = { description: string; title: string };
export type MobilePushRuntime = {
  enabled: boolean;
  endpointGeneration: bigint;
  endpointVerified: boolean;
  permission: string;
  policy: MobilePushPolicy;
  preferenceVersion: bigint;
  state: string;
  validUntil: string;
};
export type MobilePushSettings = {
  bindings: Array<MobilePushBinding>;
  draft: MobilePushPolicy;
  permissions: Array<string>;
  published: MobilePushPolicy;
  revision: bigint;
  tenantKey: string;
};
export type MobilePushTestDevices = { items: Array<MobileEngagementDevice> };
export type MobilePushUpdate = {
  expectedRevision: bigint;
  policy: MobilePushPolicyInput;
};
export type MobileRuntimeConfiguration = {
  analytics?: MobileMeasurementPolicy;
  commerce?: Commerce;
  commerceAppearance: CommerceAppearance;
  completeTheLook?: CompleteTheLook;
  configVersion: bigint;
  designSystemVersion: number;
  entitlements: Array<string>;
  features: Record<string, boolean>;
  home: Home;
  localization: Localization;
  minimumAppVersion: string;
  navigation: Navigation;
  news?: News;
  pages?: Array<Page>;
  profile?: ProfilePresentation;
  publishedAt: string;
  push?: MobilePushPolicy;
  schemaVersion: number;
  shopify: Shopify;
  tenant: Tenant;
  theme: Theme;
};
export type MobileStoreCreditReadiness = {
  status: "not-configured" | "configured" | "verified" | "disabled" | "error";
  verifiedAt: string | null;
};
export type MobileTextParagraphInput = {
  kind: "paragraph" | "bullet" | "numbered";
  runs: Array<MobileTextRunInput>;
};
export type MobileTextRunInput = {
  bold: boolean;
  italic: boolean;
  text: string;
};
export type MobileThemeSummary = { mode: "system" | "light" | "dark" };
export type MobileVariantAvailability = {
  availableForSale: boolean;
  stockLimit: number | null;
  variantId: string;
};
export type ModelBreakdown = {
  avgLatencyMs: bigint | null;
  count: bigint;
  model: string;
};
export type Navigation = {
  enabledDestinations?: Array<string>;
  menu?: Array<MenuItem>;
};
export type News = {
  blogId?: string;
  enabled: boolean;
  title: Record<string, string>;
};
export type Page = {
  content?: Home;
  icon: string;
  id: string;
  title: Record<string, string>;
  type: string;
  url?: string;
  visible: boolean;
};
export type Palette = {
  background: string;
  border: string;
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
};
export type Product = {
  recentlyViewed: Discovery;
  recommendations: Discovery;
  showDescription: boolean;
  showVendor: boolean;
};
export type ProfilePresentation = {
  introduction: Record<string, string>;
  sections: Array<ProfileSection>;
};
export type ProfileSection = {
  id: "orders" | "addresses" | "store_credit";
  visible: boolean;
};
export type Properties = { category_path: string; product_id: string };
export type RecentSession = {
  createdAt: string;
  id: string;
  latencyMs: number | null;
  modelUsed: string | null;
  shopifyProductId: string;
  status: string;
};
export type RoleView = {
  actorRef: string;
  expiresAt: string | null;
  permissions: Array<string>;
  revision: bigint;
  role: "READER" | "EDITOR" | "ADMIN";
};
export type Section = {
  id: string;
  properties?: HomeProperties;
  type: string;
  version?: number;
  visible?: boolean;
};
export type Shopify = {
  customerAccount?: CustomerAccount;
  publicAccessToken?: string;
  storeDomain?: string;
  storefrontApiVersion?: string;
};
export type ShopifyInstallation = {
  activatedAt: string;
  installationId: string;
  schemaVersion: number;
  status: "active";
  storeId: string;
};
export type StatusBreakdown = { count: bigint; status: string };
export type StoreConfigurationResponse = {
  storeId: string;
  vtoIsActive: boolean;
  widgetColor: string;
  widgetColorOverride: boolean;
  widgetLabel: string;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
};
export type Target = {
  activatedAt: string;
  installationId: string;
  storeId: string;
};
export type Tenant = { displayName?: string; id?: string };
export type TextParagraph = { kind: string; runs: Array<TextRun> };
export type TextRun = { bold: boolean; italic: boolean; text: string };
export type Theme = {
  buttonPreset?: "solid" | "editorial";
  cardPreset?: "outlined" | "elevated";
  darkPalette?: Palette;
  fontSet?: "inter";
  hapticPreset?: "subtle";
  iconSet?: "forui";
  inputPreset?: "filled" | "underlined";
  lightPalette?: Palette;
  mode: "system" | "light" | "dark";
  motionPreset?: "standard" | "deliberate";
  navigationPreset?: "compact" | "editorial";
  preset: "minimal" | "editorial";
  radiusPreset?: "soft" | "sharp";
  shadowPreset?: "flat" | "lifted";
  skeletonPreset?: "soft" | "crisp";
  spacingPreset?: "comfortable" | "editorial";
};
export type TopProduct = { count: bigint; shopifyProductId: string };
export type Totals = {
  avgLatencyMs: bigint | null;
  failedCount: bigint;
  successCount: bigint;
  tryOns: bigint;
};
export type TryOnRequest = {
  photoBase64: string;
  profile_website?: string;
  size?: string;
  variantId: string;
};
export type TryOnResponse = {
  image: string;
  latencyMs: bigint;
  mediaType?: "image/png" | "image/jpeg" | "image/webp";
};
export type View = {
  planTier?: string;
  storeId?: string;
  tryOnsIncluded?: number;
  tryOnsRemaining?: number;
};
export type VtoConfigurationUpdate = {
  vtoIsActive?: boolean;
  widgetColor?: string;
  widgetColorOverride?: boolean;
  widgetLabel?: string;
  widgetPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
};
export type VtoOwnerInitialization = {
  activatedAt: string;
  installationId: string;
};
export type WidgetConfigurationResponse = {
  active: boolean;
  widgetColor: string;
  widgetColorOverride: boolean;
  widgetLabel: string;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
};
export interface CurrentSchemas {
  Access: Access;
  AnalyticsResponse: AnalyticsResponse;
  ApiProblem: ApiProblem;
  ApiProblemFieldError: ApiProblemFieldError;
  AppUi: AppUi;
  AssignGarmentTypeRequest: AssignGarmentTypeRequest;
  AssignGarmentTypeResponse: AssignGarmentTypeResponse;
  BillingAccess: BillingAccess;
  BillingCatalog: BillingCatalog;
  BillingCommandResult: BillingCommandResult;
  BillingCommercialUsage: BillingCommercialUsage;
  BillingDetails: BillingDetails;
  BillingPlan: BillingPlan;
  BillingPlanUsage: BillingPlanUsage;
  BillingProposal: BillingProposal;
  BillingSubscribe: BillingSubscribe;
  BillingSubscription: BillingSubscription;
  BillingUsage: BillingUsage;
  BillingVerification: BillingVerification;
  Buyer: Buyer;
  Cart: Cart;
  Catalog: Catalog;
  Collection: Collection;
  Commerce: Commerce;
  CommerceAppearance: CommerceAppearance;
  CommerceLayout: CommerceLayout;
  CommerceSection: CommerceSection;
  CompleteTheLook: CompleteTheLook;
  CustomerAccount: CustomerAccount;
  Discovery: Discovery;
  GarmentGroupDto: GarmentGroupDto;
  GroupBreakdown: GroupBreakdown;
  Home: Home;
  HomeAction: HomeAction;
  HomeImage: HomeImage;
  HomeProperties: HomeProperties;
  Localization: Localization;
  Look: Look;
  MenuItem: MenuItem;
  Merchandising: Merchandising;
  MerchandisingGroup: MerchandisingGroup;
  MobileAccount: MobileAccount;
  MobileAccountConfiguration: MobileAccountConfiguration;
  MobileAccountConfigure: MobileAccountConfigure;
  MobileAccountDisable: MobileAccountDisable;
  MobileAccountMutation: MobileAccountMutation;
  MobileAppearance: MobileAppearance;
  MobileBuildArtifact: MobileBuildArtifact;
  MobileCampaignAction: MobileCampaignAction;
  MobileCampaignAudience: MobileCampaignAudience;
  MobileCampaignContent: MobileCampaignContent;
  MobileCampaignCreate: MobileCampaignCreate;
  MobileCampaignDestination: MobileCampaignDestination;
  MobileCampaignPair: MobileCampaignPair;
  MobileCampaignSchedule: MobileCampaignSchedule;
  MobileCampaignSchedulePreview: MobileCampaignSchedulePreview;
  MobileCampaignTest: MobileCampaignTest;
  MobileCampaignUpdate: MobileCampaignUpdate;
  MobileCapabilityStatus: MobileCapabilityStatus;
  MobileCheckoutAccess: MobileCheckoutAccess;
  MobileCommandCompleted: MobileCommandCompleted;
  MobileCommerceCartInput: MobileCommerceCartInput;
  MobileCommerceCatalogInput: MobileCommerceCatalogInput;
  MobileCommerceCollectionInput: MobileCommerceCollectionInput;
  MobileCommerceDiscoveryInput: MobileCommerceDiscoveryInput;
  MobileCommerceDraft: MobileCommerceDraft;
  MobileCommerceInput: MobileCommerceInput;
  MobileCommerceLayoutInput: MobileCommerceLayoutInput;
  MobileCommerceProductInput: MobileCommerceProductInput;
  MobileCommerceSectionInput: MobileCommerceSectionInput;
  MobileCommerceUpdate: MobileCommerceUpdate;
  MobileCurrentPublication: MobileCurrentPublication;
  MobileDeviceCart: MobileDeviceCart;
  MobileDeviceEndpoint: MobileDeviceEndpoint;
  MobileDeviceEnrolment: MobileDeviceEnrolment;
  MobileDeviceEvent: MobileDeviceEvent;
  MobileDeviceEvents: MobileDeviceEvents;
  MobileDeviceFlowPreferences: MobileDeviceFlowPreferences;
  MobileDeviceMeasurementPreferences: MobileDeviceMeasurementPreferences;
  MobileDevicePreview: MobileDevicePreview;
  MobileDeviceProof: MobileDeviceProof;
  MobileDevicePushPreferences: MobileDevicePushPreferences;
  MobileDeviceReceipt: MobileDeviceReceipt;
  MobileDeviceRegistration: MobileDeviceRegistration;
  MobileDeviceReset: MobileDeviceReset;
  MobileDeviceSignal: MobileDeviceSignal;
  MobileDeviceSignals: MobileDeviceSignals;
  MobileDraft: MobileDraft;
  MobileDraftApply: MobileDraftApply;
  MobileDraftChanges: MobileDraftChanges;
  MobileDraftCommerceAppearancePatch: MobileDraftCommerceAppearancePatch;
  MobileDraftMutation: MobileDraftMutation;
  MobileDraftPalette: MobileDraftPalette;
  MobileDraftPublish: MobileDraftPublish;
  MobileDraftPublished: MobileDraftPublished;
  MobileDraftThemePatch: MobileDraftThemePatch;
  MobileDraftUpdate: MobileDraftUpdate;
  MobileEditorialBlog: MobileEditorialBlog;
  MobileEditorialBlogs: MobileEditorialBlogs;
  MobileEditorialImage: MobileEditorialImage;
  MobileEditorialImages: MobileEditorialImages;
  MobileEditorialSummary: MobileEditorialSummary;
  MobileEngagementAudience: MobileEngagementAudience;
  MobileEngagementCampaign: MobileEngagementCampaign;
  MobileEngagementCampaignDetail: MobileEngagementCampaignDetail;
  MobileEngagementCampaignPage: MobileEngagementCampaignPage;
  MobileEngagementContent: MobileEngagementContent;
  MobileEngagementDestination: MobileEngagementDestination;
  MobileEngagementDestinationSummary: MobileEngagementDestinationSummary;
  MobileEngagementDevice: MobileEngagementDevice;
  MobileEngagementEstimate: MobileEngagementEstimate;
  MobileEngagementSchedulePreview: MobileEngagementSchedulePreview;
  MobileFavorite: MobileFavorite;
  MobileFavoriteDelete: MobileFavoriteDelete;
  MobileFavoriteMetadata: MobileFavoriteMetadata;
  MobileFavoriteMutation: MobileFavoriteMutation;
  MobileFavoritePage: MobileFavoritePage;
  MobileFavoriteRename: MobileFavoriteRename;
  MobileFavoriteSave: MobileFavoriteSave;
  MobileFlowAction: MobileFlowAction;
  MobileFlowCreate: MobileFlowCreate;
  MobileFlowDefinition: MobileFlowDefinition;
  MobileFlowDefinitionInput: MobileFlowDefinitionInput;
  MobileFlowDetail: MobileFlowDetail;
  MobileFlowDevicePolicy: MobileFlowDevicePolicy;
  MobileFlowFlow: MobileFlowFlow;
  MobileFlowInstance: MobileFlowInstance;
  MobileFlowInstances: MobileFlowInstances;
  MobileFlowMoney: MobileFlowMoney;
  MobileFlowPage: MobileFlowPage;
  MobileFlowReport: MobileFlowReport;
  MobileFlowStep: MobileFlowStep;
  MobileFlowStepInput: MobileFlowStepInput;
  MobileFlowUpdate: MobileFlowUpdate;
  MobileFlowValidation: MobileFlowValidation;
  MobileHistoryApplyResult: MobileHistoryApplyResult;
  MobileHistoryDetail: MobileHistoryDetail;
  MobileHistoryEntry: MobileHistoryEntry;
  MobileHistoryPage: MobileHistoryPage;
  MobileHistorySummary: MobileHistorySummary;
  MobileHomeActionInput: MobileHomeActionInput;
  MobileHomeDraft: MobileHomeDraft;
  MobileHomeImageInput: MobileHomeImageInput;
  MobileHomeInput: MobileHomeInput;
  MobileHomePropertiesInput: MobileHomePropertiesInput;
  MobileHomeSectionInput: MobileHomeSectionInput;
  MobileHomeUpdate: MobileHomeUpdate;
  MobileInstallationIdentity: MobileInstallationIdentity;
  MobileLookInput: MobileLookInput;
  MobileLookProduct: MobileLookProduct;
  MobileLooksDraft: MobileLooksDraft;
  MobileLooksInput: MobileLooksInput;
  MobileLooksUpdate: MobileLooksUpdate;
  MobileMarketsCountry: MobileMarketsCountry;
  MobileMarketsLanguage: MobileMarketsLanguage;
  MobileMarketsView: MobileMarketsView;
  MobileMeasurementAccepted: MobileMeasurementAccepted;
  MobileMeasurementBuild: MobileMeasurementBuild;
  MobileMeasurementCartCorrelation: MobileMeasurementCartCorrelation;
  MobileMeasurementChallenge: MobileMeasurementChallenge;
  MobileMeasurementCoverage: MobileMeasurementCoverage;
  MobileMeasurementCredential: MobileMeasurementCredential;
  MobileMeasurementCurrencyReport: MobileMeasurementCurrencyReport;
  MobileMeasurementDaily: MobileMeasurementDaily;
  MobileMeasurementMetric: MobileMeasurementMetric;
  MobileMeasurementPolicy: MobileMeasurementPolicy;
  MobileMeasurementPolicyInput: MobileMeasurementPolicyInput;
  MobileMeasurementReport: MobileMeasurementReport;
  MobileMeasurementRuntimePolicy: MobileMeasurementRuntimePolicy;
  MobileMeasurementSettings: MobileMeasurementSettings;
  MobileMeasurementUpdate: MobileMeasurementUpdate;
  MobileMeasurementVerification: MobileMeasurementVerification;
  MobileMenuItemInput: MobileMenuItemInput;
  MobileMerchandisingDraft: MobileMerchandisingDraft;
  MobileMerchandisingGroupInput: MobileMerchandisingGroupInput;
  MobileMerchandisingInput: MobileMerchandisingInput;
  MobileMerchandisingProduct: MobileMerchandisingProduct;
  MobileMerchandisingUpdate: MobileMerchandisingUpdate;
  MobileNavigationDraft: MobileNavigationDraft;
  MobileNavigationUpdate: MobileNavigationUpdate;
  MobileNewsDraft: MobileNewsDraft;
  MobileNewsInput: MobileNewsInput;
  MobileNewsUpdate: MobileNewsUpdate;
  MobileOnboarding: MobileOnboarding;
  MobileOnboardingBuild: MobileOnboardingBuild;
  MobileOnboardingStep: MobileOnboardingStep;
  MobileOperationsView: MobileOperationsView;
  MobileOverview: MobileOverview;
  MobileOwnerInitialization: MobileOwnerInitialization;
  MobilePageInput: MobilePageInput;
  MobilePageTarget: MobilePageTarget;
  MobilePagesDraft: MobilePagesDraft;
  MobilePagesUpdate: MobilePagesUpdate;
  MobilePreviewPair: MobilePreviewPair;
  MobilePreviewRefresh: MobilePreviewRefresh;
  MobilePreviewRevoke: MobilePreviewRevoke;
  MobilePreviewSnapshot: MobilePreviewSnapshot;
  MobilePreviewStart: MobilePreviewStart;
  MobilePrivatePreview: MobilePrivatePreview;
  MobileProfileDraft: MobileProfileDraft;
  MobileProfileInput: MobileProfileInput;
  MobileProfileSectionInput: MobileProfileSectionInput;
  MobileProfileUpdate: MobileProfileUpdate;
  MobilePublicationContentDto: MobilePublicationContentDto;
  MobilePublicationSummary: MobilePublicationSummary;
  MobilePushBinding: MobilePushBinding;
  MobilePushPairing: MobilePushPairing;
  MobilePushPolicy: MobilePushPolicy;
  MobilePushPolicyInput: MobilePushPolicyInput;
  MobilePushPrompt: MobilePushPrompt;
  MobilePushPromptInput: MobilePushPromptInput;
  MobilePushRuntime: MobilePushRuntime;
  MobilePushSettings: MobilePushSettings;
  MobilePushTestDevices: MobilePushTestDevices;
  MobilePushUpdate: MobilePushUpdate;
  MobileRuntimeConfiguration: MobileRuntimeConfiguration;
  MobileStoreCreditReadiness: MobileStoreCreditReadiness;
  MobileTextParagraphInput: MobileTextParagraphInput;
  MobileTextRunInput: MobileTextRunInput;
  MobileThemeSummary: MobileThemeSummary;
  MobileVariantAvailability: MobileVariantAvailability;
  ModelBreakdown: ModelBreakdown;
  Navigation: Navigation;
  News: News;
  Page: Page;
  Palette: Palette;
  Product: Product;
  ProfilePresentation: ProfilePresentation;
  ProfileSection: ProfileSection;
  Properties: Properties;
  RecentSession: RecentSession;
  RoleView: RoleView;
  Section: Section;
  Shopify: Shopify;
  ShopifyInstallation: ShopifyInstallation;
  StatusBreakdown: StatusBreakdown;
  StoreConfigurationResponse: StoreConfigurationResponse;
  Target: Target;
  Tenant: Tenant;
  TextParagraph: TextParagraph;
  TextRun: TextRun;
  Theme: Theme;
  TopProduct: TopProduct;
  Totals: Totals;
  TryOnRequest: TryOnRequest;
  TryOnResponse: TryOnResponse;
  View: View;
  VtoConfigurationUpdate: VtoConfigurationUpdate;
  VtoOwnerInitialization: VtoOwnerInitialization;
  WidgetConfigurationResponse: WidgetConfigurationResponse;
}
export const int64Fields = {
  Access: ["/role/revision"],
  AnalyticsResponse: [
    "/byGroup/*/count",
    "/byModel/*/avgLatencyMs",
    "/byModel/*/count",
    "/byStatus/*/count",
    "/topProducts/*/count",
    "/totals/avgLatencyMs",
    "/totals/failedCount",
    "/totals/successCount",
    "/totals/tryOns",
  ],
  ApiProblem: [],
  ApiProblemFieldError: [],
  AppUi: [],
  AssignGarmentTypeRequest: [],
  AssignGarmentTypeResponse: [],
  BillingAccess: [],
  BillingCatalog: [],
  BillingCommandResult: [],
  BillingCommercialUsage: ["/extraCount", "/includedReserved"],
  BillingDetails: ["/usage/extraCount", "/usage/includedReserved"],
  BillingPlan: [],
  BillingPlanUsage: [],
  BillingProposal: [],
  BillingSubscribe: [],
  BillingSubscription: [],
  BillingUsage: [],
  BillingVerification: [],
  Buyer: [],
  Cart: [],
  Catalog: [],
  Collection: [],
  Commerce: [],
  CommerceAppearance: [],
  CommerceLayout: [],
  CommerceSection: [],
  CompleteTheLook: [],
  CustomerAccount: [],
  Discovery: [],
  GarmentGroupDto: [],
  GroupBreakdown: ["/count"],
  Home: [],
  HomeAction: [],
  HomeImage: [],
  HomeProperties: [],
  Localization: [],
  Look: [],
  MenuItem: [],
  Merchandising: [],
  MerchandisingGroup: [],
  MobileAccount: ["/revision"],
  MobileAccountConfiguration: ["/account/revision"],
  MobileAccountConfigure: ["/expectedRevision"],
  MobileAccountDisable: ["/expectedRevision"],
  MobileAccountMutation: ["/account/revision"],
  MobileAppearance: [],
  MobileBuildArtifact: [],
  MobileCampaignAction: ["/expectedRevision"],
  MobileCampaignAudience: [],
  MobileCampaignContent: [],
  MobileCampaignCreate: [],
  MobileCampaignDestination: [],
  MobileCampaignPair: [],
  MobileCampaignSchedule: ["/expectedRevision"],
  MobileCampaignSchedulePreview: [],
  MobileCampaignTest: ["/expectedRevision"],
  MobileCampaignUpdate: ["/expectedRevision"],
  MobileCapabilityStatus: [],
  MobileCheckoutAccess: [],
  MobileCommandCompleted: [],
  MobileCommerceCartInput: [],
  MobileCommerceCatalogInput: [],
  MobileCommerceCollectionInput: [],
  MobileCommerceDiscoveryInput: [],
  MobileCommerceDraft: ["/revision"],
  MobileCommerceInput: [],
  MobileCommerceLayoutInput: [],
  MobileCommerceProductInput: [],
  MobileCommerceSectionInput: [],
  MobileCommerceUpdate: ["/expectedRevision"],
  MobileCurrentPublication: ["/configVersion", "/revision"],
  MobileDeviceCart: [],
  MobileDeviceEndpoint: ["/generation"],
  MobileDeviceEnrolment: [],
  MobileDeviceEvent: ["/buildNumber", "/configVersion"],
  MobileDeviceEvents: [
    "/consentVersion",
    "/events/*/buildNumber",
    "/events/*/configVersion",
  ],
  MobileDeviceFlowPreferences: ["/version"],
  MobileDeviceMeasurementPreferences: ["/version"],
  MobileDevicePreview: ["/sequence", "/sourceRevision"],
  MobileDeviceProof: ["/generation"],
  MobileDevicePushPreferences: ["/version"],
  MobileDeviceReceipt: [],
  MobileDeviceRegistration: [],
  MobileDeviceReset: [],
  MobileDeviceSignal: ["/sequence"],
  MobileDeviceSignals: ["/preferenceVersion", "/signals/*/sequence"],
  MobileDraft: ["/revision"],
  MobileDraftApply: ["/expectedRevision"],
  MobileDraftChanges: [],
  MobileDraftCommerceAppearancePatch: [],
  MobileDraftMutation: ["/revision"],
  MobileDraftPalette: [],
  MobileDraftPublish: ["/expectedRevision"],
  MobileDraftPublished: [
    "/publication/configVersion",
    "/publishedRevision",
    "/revision",
  ],
  MobileDraftThemePatch: [],
  MobileDraftUpdate: ["/expectedRevision"],
  MobileEditorialBlog: [],
  MobileEditorialBlogs: [],
  MobileEditorialImage: [],
  MobileEditorialImages: [],
  MobileEditorialSummary: [],
  MobileEngagementAudience: [],
  MobileEngagementCampaign: [
    "/accepted",
    "/failed",
    "/opened",
    "/received",
    "/revision",
    "/selected",
    "/suppressed",
    "/uncertain",
  ],
  MobileEngagementCampaignDetail: [
    "/campaign/accepted",
    "/campaign/failed",
    "/campaign/opened",
    "/campaign/received",
    "/campaign/revision",
    "/campaign/selected",
    "/campaign/suppressed",
    "/campaign/uncertain",
  ],
  MobileEngagementCampaignPage: [
    "/items/*/accepted",
    "/items/*/failed",
    "/items/*/opened",
    "/items/*/received",
    "/items/*/revision",
    "/items/*/selected",
    "/items/*/suppressed",
    "/items/*/uncertain",
    "/total",
  ],
  MobileEngagementContent: [],
  MobileEngagementDestination: [],
  MobileEngagementDestinationSummary: [],
  MobileEngagementDevice: [],
  MobileEngagementEstimate: ["/eligible"],
  MobileEngagementSchedulePreview: [],
  MobileFavorite: ["/metadata/revision"],
  MobileFavoriteDelete: ["/expectedRevision"],
  MobileFavoriteMetadata: ["/revision"],
  MobileFavoriteMutation: ["/draftRevision", "/revision"],
  MobileFavoritePage: ["/entries/*/revision"],
  MobileFavoriteRename: ["/expectedRevision"],
  MobileFavoriteSave: ["/expectedRevision"],
  MobileFlowAction: ["/expectedRevision"],
  MobileFlowCreate: ["/definition/steps/*/delaySeconds"],
  MobileFlowDefinition: ["/steps/*/delaySeconds"],
  MobileFlowDefinitionInput: ["/steps/*/delaySeconds"],
  MobileFlowDetail: [
    "/flow/activeVersion",
    "/flow/draft/steps/*/delaySeconds",
    "/flow/revision",
    "/validation/durationSeconds",
    "/validation/eligible",
  ],
  MobileFlowDevicePolicy: ["/version"],
  MobileFlowFlow: [
    "/activeVersion",
    "/draft/steps/*/delaySeconds",
    "/revision",
  ],
  MobileFlowInstance: ["/version"],
  MobileFlowInstances: ["/items/*/version", "/total"],
  MobileFlowMoney: ["/orders"],
  MobileFlowPage: [
    "/items/*/activeVersion",
    "/items/*/draft/steps/*/delaySeconds",
    "/items/*/revision",
    "/total",
  ],
  MobileFlowReport: [
    "/accepted",
    "/attributed/*/orders",
    "/completed",
    "/eligible",
    "/failed",
    "/opened",
    "/received",
    "/started",
    "/stopped",
    "/suppressed",
    "/uncertain",
  ],
  MobileFlowStep: ["/delaySeconds"],
  MobileFlowStepInput: ["/delaySeconds"],
  MobileFlowUpdate: ["/definition/steps/*/delaySeconds", "/expectedRevision"],
  MobileFlowValidation: ["/durationSeconds", "/eligible"],
  MobileHistoryApplyResult: ["/configVersion", "/revision", "/sourceVersion"],
  MobileHistoryDetail: [
    "/currentConfigVersion",
    "/entry/publication/configVersion",
    "/entry/publication/restoredFromVersion",
    "/revision",
  ],
  MobileHistoryEntry: [
    "/publication/configVersion",
    "/publication/restoredFromVersion",
  ],
  MobileHistoryPage: [
    "/currentConfigVersion",
    "/entries/*/configVersion",
    "/entries/*/restoredFromVersion",
    "/revision",
  ],
  MobileHistorySummary: ["/configVersion", "/restoredFromVersion"],
  MobileHomeActionInput: [],
  MobileHomeDraft: ["/revision"],
  MobileHomeImageInput: [],
  MobileHomeInput: [],
  MobileHomePropertiesInput: [],
  MobileHomeSectionInput: [],
  MobileHomeUpdate: ["/expectedRevision"],
  MobileInstallationIdentity: [],
  MobileLookInput: [],
  MobileLookProduct: [],
  MobileLooksDraft: ["/revision"],
  MobileLooksInput: [],
  MobileLooksUpdate: ["/expectedRevision"],
  MobileMarketsCountry: [],
  MobileMarketsLanguage: [],
  MobileMarketsView: [],
  MobileMeasurementAccepted: [],
  MobileMeasurementBuild: [],
  MobileMeasurementCartCorrelation: [],
  MobileMeasurementChallenge: [],
  MobileMeasurementCoverage: [],
  MobileMeasurementCredential: [],
  MobileMeasurementCurrencyReport: ["/daily/*/appOrders"],
  MobileMeasurementDaily: ["/appOrders"],
  MobileMeasurementMetric: [],
  MobileMeasurementPolicy: [],
  MobileMeasurementPolicyInput: [],
  MobileMeasurementReport: ["/currencies/*/daily/*/appOrders"],
  MobileMeasurementRuntimePolicy: ["/configVersion", "/consentVersion"],
  MobileMeasurementSettings: ["/revision"],
  MobileMeasurementUpdate: ["/expectedRevision"],
  MobileMeasurementVerification: [],
  MobileMenuItemInput: [],
  MobileMerchandisingDraft: ["/revision"],
  MobileMerchandisingGroupInput: [],
  MobileMerchandisingInput: [],
  MobileMerchandisingProduct: [],
  MobileMerchandisingUpdate: ["/expectedRevision"],
  MobileNavigationDraft: ["/revision"],
  MobileNavigationUpdate: ["/expectedRevision"],
  MobileNewsDraft: ["/revision"],
  MobileNewsInput: [],
  MobileNewsUpdate: ["/expectedRevision"],
  MobileOnboarding: [],
  MobileOnboardingBuild: [],
  MobileOnboardingStep: [],
  MobileOperationsView: ["/configVersion"],
  MobileOverview: ["/publication/configVersion", "/revision"],
  MobileOwnerInitialization: [],
  MobilePageInput: [],
  MobilePageTarget: [],
  MobilePagesDraft: ["/revision"],
  MobilePagesUpdate: ["/expectedRevision"],
  MobilePreviewPair: [],
  MobilePreviewRefresh: ["/expectedRevision", "/expectedSequence"],
  MobilePreviewRevoke: ["/expectedSequence"],
  MobilePreviewSnapshot: [],
  MobilePreviewStart: ["/expectedRevision"],
  MobilePrivatePreview: ["/sequence", "/sourceRevision"],
  MobileProfileDraft: ["/revision"],
  MobileProfileInput: [],
  MobileProfileSectionInput: [],
  MobileProfileUpdate: ["/expectedRevision"],
  MobilePublicationContentDto: [],
  MobilePublicationSummary: ["/configVersion"],
  MobilePushBinding: [],
  MobilePushPairing: [],
  MobilePushPolicy: [],
  MobilePushPolicyInput: [],
  MobilePushPrompt: [],
  MobilePushPromptInput: [],
  MobilePushRuntime: ["/endpointGeneration", "/preferenceVersion"],
  MobilePushSettings: ["/revision"],
  MobilePushTestDevices: [],
  MobilePushUpdate: ["/expectedRevision"],
  MobileRuntimeConfiguration: ["/configVersion"],
  MobileStoreCreditReadiness: [],
  MobileTextParagraphInput: [],
  MobileTextRunInput: [],
  MobileThemeSummary: [],
  MobileVariantAvailability: [],
  ModelBreakdown: ["/avgLatencyMs", "/count"],
  Navigation: [],
  News: [],
  Page: [],
  Palette: [],
  Product: [],
  ProfilePresentation: [],
  ProfileSection: [],
  Properties: [],
  RecentSession: [],
  RoleView: ["/revision"],
  Section: [],
  Shopify: [],
  ShopifyInstallation: [],
  StatusBreakdown: ["/count"],
  StoreConfigurationResponse: [],
  Target: [],
  Tenant: [],
  TextParagraph: [],
  TextRun: [],
  Theme: [],
  TopProduct: ["/count"],
  Totals: ["/avgLatencyMs", "/failedCount", "/successCount", "/tryOns"],
  TryOnRequest: [],
  TryOnResponse: ["/latencyMs"],
  View: [],
  VtoConfigurationUpdate: [],
  VtoOwnerInitialization: [],
  WidgetConfigurationResponse: [],
} as const;
