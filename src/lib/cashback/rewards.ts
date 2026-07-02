import type { CashbackOffer } from "@/types/cashback";

export function calculateExpectedReward(
  offer: CashbackOffer,
  purchaseAmount: number
): number | null {
  if (
    offer.conditions.minPurchaseAmount !== null &&
    purchaseAmount < offer.conditions.minPurchaseAmount
  ) {
    return null;
  }

  const rawReward =
    offer.reward.type === "percent"
      ? (purchaseAmount * offer.reward.value) / 100
      : offer.reward.value;
  const limitedReward =
    offer.reward.maxAmount === null
      ? rawReward
      : Math.min(rawReward, offer.reward.maxAmount);

  return Math.round(limitedReward * 100) / 100;
}

export function getComparableRewardValue(offer: CashbackOffer): number {
  return offer.reward.value;
}
