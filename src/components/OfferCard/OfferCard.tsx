import { getBankById } from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";

/* eslint-disable react-refresh/only-export-components */
export function OfferCard({
  offer,
}: {
  offer: EvaluatedOffer;
}) {
  const bank = getBankById(offer.offer.bankId);
  const subtitle = getOfferSubtitle(offer, bank?.name ?? offer.offer.bankId);

  return (
    <article className="flex w-full items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-card-foreground">
      <span className="min-w-0 flex-1">
        <span className="block break-words text-base font-semibold leading-5">
          {offer.offer.title}
        </span>
        <span className="mt-0.5 block break-words text-sm leading-5 text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span className="shrink-0 pt-0.5 text-lg font-semibold leading-none">
        {formatRewardValue(offer)}
      </span>
    </article>
  );
}

export function formatRewardValue(offer: EvaluatedOffer) {
  if (offer.offer.reward.type === "fixed") {
    return formatMoney(offer.offer.reward.value);
  }

  return `${offer.offer.reward.value}%`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    currency: "UAH",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function getOfferSubtitle(offer: EvaluatedOffer, bankName: string) {
  if (offer.offer.description.trim().length > 0) {
    return offer.offer.description
      .replace(/^Партнерський кешбек\s+\S+\s+за\s+/i, "")
      .replace(/^Кешбек\s+\S+\s+за\s+/i, "")
      .replace(/^Кешбек за категорію\s+/i, "Категорія ")
      .replace(/\s+в липні 2026.*$/i, "")
      .replace(/\s+Категорію потрібно.*$/i, "")
      .replace(/\.$/, "");
  }

  return bankName;
}
