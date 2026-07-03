import { evaluateOffer } from "@/features/offer-evaluation/evaluateOffer";
import { groupEvaluatedOffers } from "@/features/offer-ranking/groupResults";
import { searchOffers } from "@/features/search/searchIndex";
import type {
  EvaluatedOffer,
  FundingSource,
  PaymentChannel,
  ResultGroups,
} from "@/types/cashback";

export interface EvaluateSearchInput {
  offers: Parameters<typeof searchOffers>[0];
  query: string;
  period: string;
  bankId: "all" | string;
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "automatic" | "requires-action";
  currentDate?: Date;
}

export interface EvaluateSearchOutput {
  evaluatedOffers: EvaluatedOffer[];
  groups: ResultGroups;
}

export function evaluateSearchResults(
  input: EvaluateSearchInput
): EvaluateSearchOutput {
  const searchResults = searchOffers(input.offers, input.query);
  const evaluatedOffers = searchResults
    .map((result) =>
      evaluateOffer({
        offer: result.offer,
        match: result.match,
        period: input.period,
        bankId: input.bankId,
        fundingSource: input.fundingSource,
        channel: input.channel,
        activation: input.activation,
        currentDate: input.currentDate,
      })
    )
    .filter((offer) => offer.isApplicable);

  return {
    evaluatedOffers,
    groups: groupEvaluatedOffers(evaluatedOffers),
  };
}
