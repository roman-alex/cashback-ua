import type { CashbackOffer } from "@/types/cashback";

export function getComparableRewardValue(offer: CashbackOffer): number {
  return offer.reward.value;
}
