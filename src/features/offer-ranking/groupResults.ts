import {
  getComparableRewardValue,
} from "@/lib/cashback/rewards";
import type { EvaluatedOffer, ResultGroups } from "@/types/cashback";

export function groupEvaluatedOffers(
  evaluatedOffers: EvaluatedOffer[]
): ResultGroups {
  const bestForYou = evaluatedOffers
    .filter(
      (offer) =>
        offer.ownsEligibleCard &&
        offer.isApplicable &&
        offer.isCurrentlyValid &&
        offer.isActivated
    )
    .sort(sortReadyOffers);
  const availableAfterActivation = evaluatedOffers
    .filter(
      (offer) =>
        offer.ownsEligibleCard &&
        offer.isCurrentlyValid &&
        offer.isApplicable &&
        !offer.isActivated &&
        offer.activationStatus !== "not-available"
    )
    .sort(sortReadyOffers);
  const bestReadyReward = Math.max(
    0,
    ...bestForYou.map((offer) => getPotentialReward(offer))
  );
  const betterInOtherBanks = evaluatedOffers
    .filter((offer) => {
      if (offer.ownsEligibleCard || !offer.isCurrentlyValid) {
        return false;
      }

      if (bestForYou.length === 0) {
        return true;
      }

      return getPotentialReward(offer) > bestReadyReward;
    })
    .sort(sortReadyOffers);
  const groupedIds = new Set(
    [...bestForYou, ...availableAfterActivation, ...betterInOtherBanks].map(
      (offer) => offer.offer.id
    )
  );
  const otherOffers = evaluatedOffers
    .filter((offer) => !groupedIds.has(offer.offer.id))
    .sort(sortReadyOffers);

  return {
    bestForYou,
    availableAfterActivation,
    betterInOtherBanks,
    otherOffers,
  };
}

function sortReadyOffers(left: EvaluatedOffer, right: EvaluatedOffer) {
  const leftPotentialReward = getPotentialReward(left);
  const rightPotentialReward = getPotentialReward(right);

  if (leftPotentialReward !== rightPotentialReward) {
    return rightPotentialReward - leftPotentialReward;
  }

  const leftRewardValue = getComparableRewardValue(left.offer);
  const rightRewardValue = getComparableRewardValue(right.offer);

  if (leftRewardValue !== rightRewardValue) {
    return rightRewardValue - leftRewardValue;
  }

  return right.match.score - left.match.score;
}

function getPotentialReward(offer: EvaluatedOffer) {
  return offer.expectedReward ?? getComparableRewardValue(offer.offer);
}
