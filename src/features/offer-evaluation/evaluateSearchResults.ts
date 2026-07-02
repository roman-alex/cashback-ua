import { evaluateOffer } from "@/features/offer-evaluation/evaluateOffer";
import { groupEvaluatedOffers } from "@/features/offer-ranking/groupResults";
import { searchOffers } from "@/features/search/searchIndex";
import type {
  EvaluatedOffer,
  FundingSource,
  PaymentChannel,
  ResultGroups,
} from "@/types/cashback";
import type {
  CurrentMonthPreferences,
  UserPreferences,
} from "@/types/preferences";

export interface EvaluateSearchInput {
  offers: Parameters<typeof searchOffers>[0];
  query: string;
  period: string;
  userPreferences: UserPreferences;
  currentMonthPreferences: CurrentMonthPreferences;
  purchaseAmount: number | null;
  bankScope: "my" | "all";
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "ready-to-use" | "requires-activation";
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
        userPreferences: input.userPreferences,
        currentMonthPreferences: input.currentMonthPreferences,
        purchaseAmount: input.purchaseAmount,
        bankScope: input.bankScope,
        fundingSource: input.fundingSource,
        channel: input.channel,
        currentDate: input.currentDate,
      })
    )
    .filter((offer) => matchesBankScope(offer, input.bankScope))
    .filter((offer) => matchesActivationFilter(offer, input.activation));

  return {
    evaluatedOffers,
    groups: groupEvaluatedOffers(evaluatedOffers),
  };
}

function matchesBankScope(
  offer: EvaluatedOffer,
  bankScope: EvaluateSearchInput["bankScope"]
) {
  return bankScope === "all" || offer.belongsToUser;
}

function matchesActivationFilter(
  offer: EvaluatedOffer,
  activation: EvaluateSearchInput["activation"]
) {
  if (activation === "ready-to-use") {
    return offer.isActivated;
  }

  if (activation === "requires-activation") {
    return !offer.isActivated && offer.activationStatus !== "not-available";
  }

  return true;
}
