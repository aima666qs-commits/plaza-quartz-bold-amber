import type { Qty } from "./decimal.ts";

export type ReviewStatus =
  | "primary_text_checked"
  | "translation_checked"
  | "institutional_page_checked"
  | "unverified"
  | "scholar_review_absent";

export type SourceType = "quran" | "hadith" | "fiqh" | "institutional" | "market" | "metrology" | "math";

export interface SourceRecord {
  sourceId: string;
  type: SourceType;
  title: string;
  author: string;
  url: string;
  locator: string;
  language: string;
  translator?: string;
  retrievedAt: string;
  edition?: string;
  terms: string;
  review: ReviewStatus;
  arabic?: string;
  translationRu?: string;
  translationEn?: string;
  notes: string;
}

export interface RuleRecord {
  ruleId: string;
  version: string;
  profileIds: string[];
  domain: string;
  conditions: string;
  exceptions: string;
  formula: string;
  sourceIds: string[];
  tests: string[];
  review: ReviewStatus;
}

export type ProfileId =
  | "hanafi"
  | "maliki"
  | "shafii"
  | "hanbali"
  | "islamic-relief-silver"
  | "zfa-gold-85"
  | "custom";

export type NisabMode = "gold" | "silver" | "lower" | "higher" | "separate";

export interface Profile {
  id: ProfileId;
  name: string;
  school?: "hanafi" | "maliki" | "shafii" | "hanbali" | "institutional" | "custom";
  version: string;
  nisabGoldGrams: string;
  nisabSilverGrams: string;
  nisabMode: NisabMode;
  combineGoldSilverByValue: boolean;
  jewelryPersonalZakatable: boolean;
  livestockCashOk: boolean;
  cropCashOk: boolean;
  fitrCashOk: boolean;
  debtsDeductImmediate: boolean;
  tradeAtMarket: boolean;
  proxy25Allowed: boolean;
  notes: string;
  sourceIds: string[];
  review: ReviewStatus;
}

export type QuoteStatus = "live" | "historical" | "stale" | "manual" | "missing";

export interface Quote {
  id: string;
  asset: string;
  base: string;
  quote: string;
  unit: string;
  rate: string;
  marketTime: string | null;
  fetchedAt: string;
  source: string;
  status: QuoteStatus;
  author?: string;
}

export interface QuoteSnapshot {
  asOfDate: string;
  fetchedAt: string;
  quotes: Quote[];
}

export interface MoneyLine {
  id: string;
  label: string;
  currency: string;
  amount: string;
  ownerSharePct: string;
  joint: boolean;
}

export interface MetalLine {
  id: string;
  metal: "gold" | "silver";
  grams: string;
  purityPerMille: string;
  form: "bullion" | "coin" | "jewelry" | "other";
  use: "personal_wear" | "investment" | "trade" | "unknown";
}

export interface InvestmentLine {
  id: string;
  kind: "stock" | "fund" | "etf" | "sukuk" | "pension" | "other";
  label: string;
  currency: string;
  marketValue: string;
  mode: "trade_100" | "asset_fraction" | "proxy_25";
  assetFractionPct: string;
  ownerSharePct: string;
}

export interface CryptoLine {
  id: string;
  symbol: string;
  name: string;
  quantity: string;
  price: string;
  priceCurrency: string;
  coingeckoId?: string;
  network?: string;
  contract?: string;
  availability: "liquid" | "staked" | "locked" | "defi" | "lent" | "unknown";
  purpose: "payment" | "trade" | "hold" | "unknown";
}

export interface DebtLine {
  id: string;
  kind: "payable" | "receivable";
  label: string;
  currency: string;
  amount: string;
  timing: "immediate" | "long" | "unknown";
  collectible: "yes" | "no" | "unknown";
}

export interface RealEstateLine {
  id: string;
  purpose: "personal" | "trade" | "rental";
  label: string;
  currency: string;
  propertyValue: string;
  annualRent: string;
}

export interface CropLine {
  id: string;
  cropType: string;
  massKg: string;
  irrigation: "natural" | "costly" | "mixed" | "unknown";
  mixedNaturalSharePct: string;
  pricePerKg: string;
  currency: string;
}

export interface TradeGoods {
  inventory: string;
  businessCash: string;
  receivables: string;
  payables: string;
  currency: string;
  ownerSharePct: string;
}

export interface LivestockInput {
  grazing: boolean | null;
  hawlConfirmed: boolean | null;
  sheep: string;
  camels: string;
  cattle: string;
  cashSubstitute: boolean;
  priceSheep: string;
  priceCamel: string;
  priceCattle: string;
  currency: string;
}

export interface FitrInput {
  people: string;
  mode: "food_sa" | "cash_equivalent";
  product: "dates" | "barley" | "wheat" | "raisins" | "local";
  cashPerPerson: string;
  currency: string;
  region: string;
  year: string;
}

export interface RikazInput {
  classifiedAsRikaz: boolean | null;
  amount: string;
  currency: string;
  note: string;
}

export interface SpecialSituations {
  minorOwner: boolean;
  inherited: boolean;
  incompleteOwnership: boolean;
  prepaid: boolean;
  overduePeriods: string;
}

export interface CalculationInput {
  schemaVersion: 1;
  id: string;
  title: string;
  asOfDate: string;
  baseCurrency: string;
  profileId: ProfileId;
  nisabOverride?: {
    goldGrams?: string;
    silverGrams?: string;
    mode?: NisabMode;
  };
  hawlConfirmed: boolean | null;
  hawlStartDate: string;
  calendar: "hijri_lunar" | "gregorian_approx";
  money: MoneyLine[];
  metals: MetalLine[];
  trade: TradeGoods;
  investments: InvestmentLine[];
  realEstate: RealEstateLine[];
  crypto: CryptoLine[];
  debts: DebtLine[];
  livestock: LivestockInput;
  crops: CropLine[];
  rikaz: RikazInput;
  fitr: FitrInput;
  special: SpecialSituations;
  quotes: QuoteSnapshot;
}

export type CategoryStatus =
  | "not_entered"
  | "incomplete"
  | "below_nisab"
  | "due"
  | "exempt"
  | "not_applicable"
  | "unverified_rule";

export type KindUnit = "money" | "kg" | "head" | "sa";

export interface NaturalDue {
  unit: "sheep" | "camel_bint_makhad" | "camel_bint_labun" | "camel_hiqqa" | "camel_jadhah" | "cattle_tabi" | "cattle_musinna" | "kg" | "sa";
  count: string;
  label: string;
  alternatives?: string[];
}

export interface Step {
  id: string;
  label: string;
  input?: string;
  output?: string;
  ruleId?: string;
}

export interface CategoryResult {
  id: string;
  title: string;
  status: CategoryStatus;
  included: boolean;
  reasons: string[];
  missing: string[];
  baseMoney?: Qty;
  zakatMoney?: Qty;
  natural?: NaturalDue[];
  ruleIds: string[];
  sourceIds: string[];
  steps: Step[];
}

export interface NisabResult {
  goldGrams: Qty;
  silverGrams: Qty;
  goldValue: Qty | null;
  silverValue: Qty | null;
  threshold: Qty | null;
  mode: NisabMode;
  ruleId: string;
  missing: string[];
}

export interface CalculationResult {
  schemaVersion: 1;
  inputId: string;
  profileId: ProfileId;
  profileVersion: string;
  asOfDate: string;
  baseCurrency: string;
  quotes: QuoteSnapshot;
  nisab: NisabResult;
  categories: CategoryResult[];
  totalMoneyExact: Qty;
  totalMoneyRounded: Qty;
  natural: NaturalDue[];
  completeness: "complete" | "partial";
  overallStatus: "due" | "not_due_confirmed" | "incomplete" | "mixed";
  warnings: string[];
  missing: string[];
  computedAt: string;
}

export interface SavedCalculation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  input: CalculationInput;
  result: CalculationResult;
}
