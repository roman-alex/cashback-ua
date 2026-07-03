import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getBankById,
  getCards,
} from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";
import { cn } from "@/lib/utils";

/* eslint-disable react-refresh/only-export-components */
export function OfferCard({
  offer,
  onOpenDetails,
}: {
  offer: EvaluatedOffer;
  onOpenDetails: () => void;
}) {
  const bank = getBankById(offer.offer.bankId);
  const cards = getCards().filter((card) => offer.offer.cardIds.includes(card.id));

  return (
    <article className="space-y-4 rounded-md border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {bank?.name ?? offer.offer.bankId}
            </span>
            <ActivationBadge status={offer.activationStatus} />
          </div>
          <h3 className="mt-3 text-lg font-semibold">{offer.offer.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {cards.map((card) => card.name).join(", ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold">{formatRewardValue(offer)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {offer.offer.fundingSources.map((source) => (
          <span key={source} className="rounded-md bg-muted px-2 py-1">
            {source === "own" ? "Власні кошти" : "Кредитні кошти"}
          </span>
        ))}
        {offer.offer.channels.map((channel) => (
          <span key={channel} className="rounded-md bg-muted px-2 py-1">
            {channel === "online" ? "Онлайн" : "Офлайн"}
          </span>
        ))}
        {offer.offer.reward.maxAmount !== null ? (
          <span className="rounded-md bg-muted px-2 py-1">
            Ліміт {formatMoney(offer.offer.reward.maxAmount)}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Дані перевірено {formatDate(offer.offer.source.verifiedAt)}
        </p>
        <Button onClick={onOpenDetails} size="sm" type="button" variant="ghost">
          Деталі
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

export function ActivationBadge({
  status,
}: {
  status: EvaluatedOffer["activationStatus"];
}) {
  const labels = {
    automatic: "Автоматично",
    unknown: "Потрібно підключити",
  };

  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium",
        status === "automatic"
          ? "bg-primary/10 text-primary"
          : "bg-secondary/20 text-secondary-foreground"
      )}
    >
      {labels[status]}
    </span>
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
