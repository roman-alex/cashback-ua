import { getComparableRewardValue } from "@/lib/cashback/rewards";
import type { EvaluatedOffer } from "@/types/cashback";

export function sortEvaluatedOffers(
  evaluatedOffers: EvaluatedOffer[]
): EvaluatedOffer[] {
  return [...evaluatedOffers].sort((left, right) => {
    if (left.match.score !== right.match.score) {
      return right.match.score - left.match.score;
    }

    const leftRewardValue = getComparableRewardValue(left.offer);
    const rightRewardValue = getComparableRewardValue(right.offer);

    return rightRewardValue - leftRewardValue;
  });
}
