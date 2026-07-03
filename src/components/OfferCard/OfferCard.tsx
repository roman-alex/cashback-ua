import type { EvaluatedOffer } from "@/types/cashback";

/* eslint-disable react-refresh/only-export-components */
export function OfferCard({
  bankId,
  bankName,
  offer,
}: {
  bankId: string;
  bankName: string;
  offer: EvaluatedOffer;
}) {
  const bankBadge = getBankBadge(bankId, bankName);
  const subtitle = getOfferSubtitle(offer, bankBadge.label);

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
      <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
        <span className="text-lg font-semibold leading-none">
          {formatRewardValue(offer)}
        </span>
        <span
          className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${bankBadge.className}`}
        >
          {bankBadge.label}
        </span>
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
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
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

function getBankBadge(bankId: string, bankName: string) {
  switch (bankId) {
    case "abank":
      return {
        className: "border-green-400/45 bg-green-400/10 text-green-300",
        label: "abank",
      };
    case "kasta":
      return {
        className: "border-orange-400/45 bg-orange-400/10 text-orange-300",
        label: "Kasta",
      };
    case "monobank":
      return {
        className: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
        label: "mono",
      };
    case "pumb":
      return {
        className: "border-red-500/45 bg-red-500/10 text-red-300",
        label: "Pumb",
      };
    case "raiffeisen":
      return {
        className: "border-yellow-400/45 bg-yellow-400/10 text-yellow-300",
        label: "Raif",
      };
    case "sense":
      return {
        className: "border-violet-400/40 bg-violet-400/10 text-violet-300",
        label: "Sense",
      };
    default:
      return {
        className: "border-primary/35 bg-primary/10 text-primary",
        label: bankName,
      };
  }
}
