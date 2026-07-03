import type {
  CashbackOffer,
  OfferSearchMatch,
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
  text: string;
}

export interface SearchableOffer {
  offer: CashbackOffer;
  document: SearchDocument;
  merchantNames: string[];
  merchantAliases: string[];
  categoryNames: string[];
  categoryAliases: string[];
}

export interface OfferSearchResult {
  offer: CashbackOffer;
  match: OfferSearchMatch;
}
