import type {
  CashbackOffer,
  EvaluatedOffer,
  FundingSource,
  OfferSearchMatch,
  PaymentChannel,
} from "@/types/cashback";

export interface EvaluationInput {
  offer: CashbackOffer;
  match: OfferSearchMatch;
  period: string;
  bankId: "all" | string;
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "automatic" | "requires-action";
  currentDate?: Date;
}

export function evaluateOffer(input: EvaluationInput): EvaluatedOffer {
  const {
    activation,
    bankId,
    channel,
    currentDate = new Date(),
    fundingSource,
    match,
    offer,
    period,
  } = input;
  const activationStatus = getActivationStatus(offer);
  const isActivated = activationStatus === "automatic";
  const isCurrentlyValid = isOfferCurrentlyValid(offer, period, currentDate);
  const missingRequirements: string[] = [];

  if (!isCurrentlyValid) {
    missingRequirements.push("offer-not-currently-valid");
  }

  if (bankId !== "all" && offer.bankId !== bankId) {
    missingRequirements.push("bank-not-selected");
  }

  if (!matchesFundingSource(offer, fundingSource)) {
    missingRequirements.push("funding-source-not-supported");
  }

  if (!matchesChannel(offer, channel)) {
    missingRequirements.push("channel-not-supported");
  }

  if (!matchesActivation(activationStatus, activation)) {
    missingRequirements.push("activation-not-matched");
  }

  return {
    offer,
    isCurrentlyValid,
    isActivated,
    isApplicable: missingRequirements.length === 0,
    activationStatus,
    match,
    missingRequirements,
  };
}

function getActivationStatus(offer: CashbackOffer): EvaluatedOffer["activationStatus"] {
  if (offer.activation.mode === "automatic") {
    return "automatic";
  }

  return "unknown";
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

function matchesActivation(
  activationStatus: EvaluatedOffer["activationStatus"],
  activation: EvaluationInput["activation"]
) {
  if (activation === "all") {
    return true;
  }

  if (activation === "automatic") {
    return activationStatus === "automatic";
  }

  return activationStatus !== "automatic";
}
