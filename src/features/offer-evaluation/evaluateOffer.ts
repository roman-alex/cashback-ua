import { calculateExpectedReward } from "@/lib/cashback/rewards";
import { getCards } from "@/lib/static-data/staticDataRepository";
import type {
  CashbackOffer,
  EvaluatedOffer,
  FundingSource,
  OfferSearchMatch,
  PaymentChannel,
} from "@/types/cashback";
import type {
  CurrentMonthPreferences,
  UserPreferences,
} from "@/types/preferences";

export interface EvaluationInput {
  offer: CashbackOffer;
  match: OfferSearchMatch;
  period: string;
  userPreferences: UserPreferences;
  currentMonthPreferences: CurrentMonthPreferences;
  purchaseAmount: number | null;
  bankScope: "my" | "all";
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  currentDate?: Date;
}

export function evaluateOffer(input: EvaluationInput): EvaluatedOffer {
  const {
    channel,
    currentDate = new Date(),
    currentMonthPreferences,
    fundingSource,
    match,
    offer,
    period,
    purchaseAmount,
    bankScope,
    userPreferences,
  } = input;
  const selectedBankIds = new Set(userPreferences.selectedBankIds);
  const selectedCardIds = new Set(userPreferences.selectedCardIds);
  const offerCards = getCards().filter((card) => offer.cardIds.includes(card.id));
  const selectedEligibleCards = offerCards.filter((card) =>
    selectedCardIds.has(card.id)
  );
  const belongsToUser =
    selectedBankIds.size > 0 ? selectedBankIds.has(offer.bankId) : false;
  const ownsEligibleCard = selectedEligibleCards.length > 0;
  const activationStatus = getActivationStatus(offer, currentMonthPreferences);
  const isActivated =
    activationStatus === "automatic" || activationStatus === "activated";
  const isCurrentlyValid = isOfferCurrentlyValid(offer, period, currentDate);
  const missingRequirements: string[] = [];

  if (!isCurrentlyValid) {
    missingRequirements.push("offer-not-currently-valid");
  }

  if (bankScope === "my" && selectedBankIds.size > 0 && !belongsToUser) {
    missingRequirements.push("bank-not-selected");
  }

  if (selectedCardIds.size > 0 && !ownsEligibleCard) {
    missingRequirements.push("eligible-card-not-selected");
  }

  if (!matchesFundingSource(offer, fundingSource)) {
    missingRequirements.push("funding-source-not-supported");
  }

  if (!matchesChannel(offer, channel)) {
    missingRequirements.push("channel-not-supported");
  }

  if (!matchesSelectedCardFunding(offerCards, selectedCardIds, fundingSource)) {
    missingRequirements.push("selected-card-funding-not-supported");
  }

  if (!matchesPaymentSystems(offer, selectedEligibleCards)) {
    missingRequirements.push("payment-system-not-supported");
  }

  if (activationStatus === "not-available") {
    missingRequirements.push("personal-offer-not-available");
  }

  if (
    purchaseAmount !== null &&
    offer.conditions.minPurchaseAmount !== null &&
    purchaseAmount < offer.conditions.minPurchaseAmount
  ) {
    missingRequirements.push("below-min-purchase-amount");
  }

  const expectedReward =
    purchaseAmount === null
      ? null
      : calculateExpectedReward(offer, purchaseAmount);

  return {
    offer,
    belongsToUser,
    ownsEligibleCard,
    isCurrentlyValid,
    isActivated,
    isApplicable: missingRequirements.length === 0,
    activationStatus,
    expectedReward,
    match,
    missingRequirements,
  };
}

function getActivationStatus(
  offer: CashbackOffer,
  currentMonthPreferences: CurrentMonthPreferences
): EvaluatedOffer["activationStatus"] {
  if (offer.activation.mode === "automatic") {
    return "automatic";
  }

  const preference = currentMonthPreferences.offerPreferences.find(
    (offerPreference) => offerPreference.offerId === offer.id
  );

  return preference?.status ?? "unknown";
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

function matchesFundingSource(
  offer: CashbackOffer,
  fundingSource: "all" | FundingSource
) {
  return fundingSource === "all" || offer.fundingSources.includes(fundingSource);
}

function matchesChannel(offer: CashbackOffer, channel: "all" | PaymentChannel) {
  return channel === "all" || offer.channels.includes(channel);
}

function matchesSelectedCardFunding(
  offerCards: ReturnType<typeof getCards>,
  selectedCardIds: Set<string>,
  fundingSource: "all" | FundingSource
) {
  if (selectedCardIds.size === 0 || fundingSource === "all") {
    return true;
  }

  return offerCards
    .filter((card) => selectedCardIds.has(card.id))
    .some((card) =>
      fundingSource === "own"
        ? card.supportsOwnFunds
        : card.supportsCreditFunds
    );
}

function matchesPaymentSystems(
  offer: CashbackOffer,
  selectedEligibleCards: ReturnType<typeof getCards>
) {
  if (offer.conditions.paymentSystems.length === 0) {
    return true;
  }

  if (selectedEligibleCards.length === 0) {
    return true;
  }

  return selectedEligibleCards.some((card) =>
    card.paymentSystems.some((paymentSystem) =>
      offer.conditions.paymentSystems.includes(paymentSystem)
    )
  );
}
