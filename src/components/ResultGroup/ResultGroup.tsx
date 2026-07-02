import { useState } from "react";

import { OfferCard } from "@/components/OfferCard/OfferCard";
import type { EvaluatedOffer } from "@/types/cashback";

export function ResultGroup({
  collapsedByDefault = false,
  description,
  offers,
  onOpenDetails,
  title,
}: {
  collapsedByDefault?: boolean;
  description: string;
  offers: EvaluatedOffer[];
  onOpenDetails: (offer: EvaluatedOffer) => void;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(!collapsedByDefault);

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <button
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span>
          <span className="block text-xl font-semibold">
            {title} · {offers.length}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {description}
          </span>
        </span>
        <span className="rounded-md bg-muted px-2 py-1 text-sm">
          {isOpen ? "Згорнути" : "Показати"}
        </span>
      </button>

      {isOpen ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard
              key={offer.offer.id}
              offer={offer}
              onOpenDetails={() => onOpenDetails(offer)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
