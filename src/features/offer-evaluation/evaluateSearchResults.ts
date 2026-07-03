import { evaluateOffer } from "@/features/offer-evaluation/evaluateOffer";
import { sortEvaluatedOffers } from "@/features/offer-ranking/sortResults";
import { searchOffers } from "@/features/search/searchIndex";
import type { StaticCashbackData } from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";

export interface EvaluateSearchInput {
  offers: Parameters<typeof searchOffers>[0];
  staticData: StaticCashbackData;
  query: string;
  period: string;
  currentDate?: Date;
}

export interface EvaluateSearchOutput {
  evaluatedOffers: EvaluatedOffer[];
}

export function evaluateSearchResults(
  input: EvaluateSearchInput
): EvaluateSearchOutput {
  const searchResults = searchOffers(
    input.offers,
    input.query,
    input.staticData
  );
  const evaluatedOffers = searchResults
    .map((result) =>
      evaluateOffer({
        offer: result.offer,
        match: result.match,
        period: input.period,
        currentDate: input.currentDate,
      })
    )
    .filter((offer) => offer.isApplicable);

  return {
    evaluatedOffers: sortEvaluatedOffers(evaluatedOffers),
  };
}
