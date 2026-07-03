import type {
  CashbackOffer,
  EvaluatedOffer,
  OfferSearchMatch,
} from "@/types/cashback";

export interface EvaluationInput {
  offer: CashbackOffer;
  match: OfferSearchMatch;
  period: string;
  currentDate?: Date;
}

export function evaluateOffer(input: EvaluationInput): EvaluatedOffer {
  const {
    currentDate = new Date(),
    match,
    offer,
    period,
  } = input;
  const isCurrentlyValid = isOfferCurrentlyValid(offer, period, currentDate);
  const missingRequirements: string[] = [];

  if (!isCurrentlyValid) {
    missingRequirements.push("offer-not-currently-valid");
  }

  return {
    offer,
    isCurrentlyValid,
    isApplicable: missingRequirements.length === 0,
    match,
    missingRequirements,
  };
}

function isOfferCurrentlyValid(
  offer: CashbackOffer,
  period: string,
  currentDate: Date
) {
  if (!offer.id.includes(period) || offer.status !== "active") {
    return false;
  }

  const currentDateKey = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  return offer.validFrom <= currentDateKey && currentDateKey <= offer.validTo;
}
