import MiniSearch from "minisearch";

import {
  getBankById,
  getCategories,
  getMerchants,
} from "@/lib/static-data/staticDataRepository";
import { normalizeSearchText } from "@/lib/search/normalize";
import type { CashbackOffer, OfferSearchMatch } from "@/types/cashback";

import type { OfferSearchResult, SearchableOffer, SearchDocument } from "./types";

const textMatchScore = 10;

export function buildSearchableOffers(
  offers: CashbackOffer[]
): SearchableOffer[] {
  const merchants = getMerchants();
  const categories = getCategories();

  return offers.map((offer) => {
    const bank = getBankById(offer.bankId);
    const offerMerchants = merchants.filter((merchant) =>
      offer.merchantIds.includes(merchant.id)
    );
    const offerCategories = categories.filter((category) =>
      offer.categoryIds.includes(category.id)
    );
    const merchantNames = offerMerchants.map((merchant) => merchant.name);
    const merchantAliases = offerMerchants.flatMap((merchant) => merchant.aliases);
    const categoryNames = offerCategories.map((category) => category.name);
    const categoryAliases = offerCategories.flatMap(
      (category) => category.aliases
    );
    const document: SearchDocument = {
      id: offer.id,
      offerId: offer.id,
      title: normalizeSearchText(offer.title),
      bankName: normalizeSearchText(bank?.name ?? ""),
      merchantNames: normalizeSearchText(merchantNames.join(" ")),
      merchantAliases: normalizeSearchText(merchantAliases.join(" ")),
      categoryNames: normalizeSearchText(categoryNames.join(" ")),
      categoryAliases: normalizeSearchText(categoryAliases.join(" ")),
      text: normalizeSearchText(
        [
          offer.title,
          bank?.name ?? "",
          ...merchantNames,
          ...merchantAliases,
          ...categoryNames,
          ...categoryAliases,
        ].join(" ")
      ),
    };

    return {
      offer,
      document,
      merchantNames,
      merchantAliases,
      categoryNames,
      categoryAliases,
    };
  });
}

export function searchOffers(
  offers: CashbackOffer[],
  query: string
): OfferSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  const searchableOffers = buildSearchableOffers(offers);

  if (normalizedQuery.length === 0) {
    return searchableOffers.map((searchableOffer) => ({
      offer: searchableOffer.offer,
      match: {
        type: "text",
        score: 1,
      },
    }));
  }

  const exactMatches = new Map<string, OfferSearchMatch>();

  for (const searchableOffer of searchableOffers) {
    const match = getExactMatch(searchableOffer, normalizedQuery);

    if (match) {
      exactMatches.set(searchableOffer.offer.id, match);
    }
  }

  const miniSearch = new MiniSearch<SearchDocument>({
    fields: [
      "title",
      "bankName",
      "merchantNames",
      "merchantAliases",
      "categoryNames",
      "categoryAliases",
      "text",
    ],
    storeFields: ["offerId"],
    searchOptions: {
      boost: {
        merchantNames: 4,
        merchantAliases: 3,
        categoryNames: 2,
        categoryAliases: 1.5,
        title: 1.25,
      },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  miniSearch.addAll(searchableOffers.map((searchableOffer) => searchableOffer.document));

  const textResults = miniSearch.search(normalizedQuery);
  const byOfferId = new Map<string, OfferSearchResult>();

  for (const [offerId, match] of exactMatches) {
    const offer = offers.find((candidate) => candidate.id === offerId);

    if (offer) {
      byOfferId.set(offerId, { offer, match });
    }
  }

  for (const result of textResults) {
    const offer = offers.find((candidate) => candidate.id === result.offerId);

    if (!offer || byOfferId.has(offer.id)) {
      continue;
    }

    byOfferId.set(offer.id, {
      offer,
      match: {
        type: "text",
        score: textMatchScore + result.score,
      },
    });
  }

  return [...byOfferId.values()].sort(
    (left, right) => right.match.score - left.match.score
  );
}

function getExactMatch(
  searchableOffer: SearchableOffer,
  normalizedQuery: string
): OfferSearchMatch | null {
  if (containsExactValue(searchableOffer.merchantNames, normalizedQuery)) {
    return { type: "exact-merchant", score: 100 };
  }

  if (containsExactValue(searchableOffer.merchantAliases, normalizedQuery)) {
    return { type: "merchant-alias", score: 90 };
  }

  if (containsExactValue(searchableOffer.categoryNames, normalizedQuery)) {
    return { type: "category", score: 70 };
  }

  if (containsExactValue(searchableOffer.categoryAliases, normalizedQuery)) {
    return { type: "category-alias", score: 60 };
  }

  return null;
}

function containsExactValue(values: string[], normalizedQuery: string) {
  return values.some((value) => normalizeSearchText(value) === normalizedQuery);
}
