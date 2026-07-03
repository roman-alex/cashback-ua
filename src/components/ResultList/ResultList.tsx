import { OfferCard } from "@/components/OfferCard/OfferCard";
import type { EvaluatedOffer } from "@/types/cashback";

export function ResultList({
  offers,
}: {
  offers: EvaluatedOffer[];
}) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="px-0.5 text-sm font-medium text-muted-foreground">
        Знайдено · {offers.length}
      </h2>
      <div className="grid gap-2 lg:grid-cols-2">
        {offers.map((offer) => (
          <OfferCard key={offer.offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
