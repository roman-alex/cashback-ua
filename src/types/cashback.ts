export interface Bank {
  id: string;
  name: string;
  slug: string;
  logo: string;
  active: boolean;
}

export type PaymentSystem = "visa" | "mastercard";

export interface Card {
  id: string;
  bankId: string;
  name: string;
  paymentSystems: PaymentSystem[];
  supportsOwnFunds: boolean;
  supportsCreditFunds: boolean;
  active: boolean;
}

export interface CashbackCategory {
  id: string;
  name: string;
  aliases: string[];
  mccCodes: string[];
}

export interface Merchant {
  id: string;
  name: string;
  aliases: string[];
  categoryIds: string[];
  mccCodes: string[];
  active: boolean;
}

export type OfferType =
  | "category"
  | "partner"
  | "base"
  | "personal"
  | "welcome"
  | "special";

export type FundingSource = "own" | "credit";

export type PaymentChannel = "online" | "offline";

export type ActivationMode =
  | "automatic"
  | "manual"
  | "category-selection"
  | "personal-confirmation"
  | "registration";

export interface CashbackOffer {
  id: string;
  offerKey?: string;
  bankId: string;
  cardIds: string[];
  type: OfferType;
  title: string;
  description: string;
  categoryIds: string[];
  merchantIds: string[];
  mccCodes: string[];
  reward: {
    type: "percent" | "fixed";
    value: number;
    maxAmount: number | null;
    currency: "UAH";
  };
  fundingSources: FundingSource[];
  channels: PaymentChannel[];
  activation: {
    mode: ActivationMode;
    requiredBeforePurchase: boolean;
    instructions: string | null;
    actionUrl: string | null;
  };
  conditions: {
    minPurchaseAmount: number | null;
    firstPurchaseOnly: boolean;
    newCustomerOnly: boolean;
    paymentSystems: PaymentSystem[];
    notes: string[];
  };
  validFrom: string;
  validTo: string;
  source: {
    type: "official" | "editorial" | "manual" | "community";
    url: string | null;
    verifiedAt: string;
  };
  status: "draft" | "active" | "disabled";
}

export interface MonthlyOffersData {
  period: string;
  updatedAt: string;
  offers: CashbackOffer[];
}

export type SearchMatchType =
  | "exact-title"
  | "title-prefix"
  | "title-contains"
  | "exact-merchant"
  | "merchant-alias"
  | "category"
  | "category-alias"
  | "text";

export interface OfferSearchMatch {
  type: SearchMatchType;
  score: number;
}

export interface EvaluatedOffer {
  offer: CashbackOffer;
  isCurrentlyValid: boolean;
  isApplicable: boolean;
  match: OfferSearchMatch;
  missingRequirements: string[];
}
