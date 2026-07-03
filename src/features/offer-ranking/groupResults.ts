import { getComparableRewardValue } from "@/lib/cashback/rewards";
import type { EvaluatedOffer, ResultGroups } from "@/types/cashback";

export function groupEvaluatedOffers(
  evaluatedOffers: EvaluatedOffer[]
): ResultGroups {
  const bestMatches = evaluatedOffers
    .filter(
      (offer) =>
        offer.isApplicable &&
        offer.isCurrentlyValid &&
        offer.isActivated
    )
    .sort(sortReadyOffers);
  const needsActivation = evaluatedOffers
    .filter(
      (offer) =>
        offer.isCurrentlyValid &&
        offer.isApplicable &&
        !offer.isActivated
    )
    .sort(sortReadyOffers);
  const groupedIds = new Set(
    [...bestMatches, ...needsActivation].map((offer) => offer.offer.id)
  );
  const otherOffers = evaluatedOffers
    .filter((offer) => !groupedIds.has(offer.offer.id))
    .sort(sortReadyOffers);

  return {
    bestMatches,
    needsActivation,
    otherOffers,
  };
}

function sortReadyOffers(left: EvaluatedOffer, right: EvaluatedOffer) {
  const leftRewardValue = getComparableRewardValue(left.offer);
  const rightRewardValue = getComparableRewardValue(right.offer);

  if (leftRewardValue !== rightRewardValue) {
    return rightRewardValue - leftRewardValue;
  }

  return right.match.score - left.match.score;
}
