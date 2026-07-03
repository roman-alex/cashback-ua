import { evaluateOffer } from "@/features/offer-evaluation/evaluateOffer";
import type { CashbackOffer, EvaluatedOffer } from "@/types/cashback";

export interface DefaultCategoryOffersInput {
  offers: CashbackOffer[];
  period: string;
  currentDate?: Date;
}

export function getDefaultCategoryOffers(
  input: DefaultCategoryOffersInput
): EvaluatedOffer[] {
  const bestByCategoryId = new Map<string, EvaluatedOffer>();

  for (const offer of input.offers) {
    const categoryId = offer.categoryIds[0];

    if (
      offer.type !== "category" ||
      offer.reward.type !== "percent" ||
      !categoryId
    ) {
      continue;
    }

    const evaluatedOffer = evaluateOffer({
      currentDate: input.currentDate,
      match: { score: 1, type: "category" },
      offer,
      period: input.period,
    });

    if (!evaluatedOffer.isApplicable) {
      continue;
    }

    const currentBest = bestByCategoryId.get(categoryId);

    if (
      !currentBest ||
      offer.reward.value > currentBest.offer.reward.value
    ) {
      bestByCategoryId.set(categoryId, evaluatedOffer);
    }
  }

  return [...bestByCategoryId.values()].sort(
    (left, right) => right.offer.reward.value - left.offer.reward.value
  );
}
