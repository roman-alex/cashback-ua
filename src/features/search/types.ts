import type {
  CashbackOffer,
  OfferSearchMatch,
  PaymentChannel,
  FundingSource,
} from "@/types/cashback";

export interface SearchDocument {
  id: string;
  offerId: string;
  title: string;
  bankName: string;
  merchantNames: string;
  merchantAliases: string;
  categoryNames: string;
  categoryAliases: string;
  mccCodes: string;
  text: string;
}

export interface SearchableOffer {
  offer: CashbackOffer;
  document: SearchDocument;
  merchantNames: string[];
  merchantAliases: string[];
  categoryNames: string[];
  categoryAliases: string[];
  mccCodes: string[];
}

export interface OfferSearchResult {
  offer: CashbackOffer;
  match: OfferSearchMatch;
}

export interface SearchFilters {
  bankId: "all" | string;
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "automatic" | "requires-action";
}
