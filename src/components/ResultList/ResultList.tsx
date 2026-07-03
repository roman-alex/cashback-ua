import { OfferCard } from "@/components/OfferCard/OfferCard";
import {
  getBankById,
  type StaticCashbackData,
} from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";

export function ResultList({
  offers,
  staticData,
  title = "Знайдено",
}: {
  offers: EvaluatedOffer[];
  staticData: StaticCashbackData;
  title?: string;
}) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="px-0.5 text-sm font-medium text-muted-foreground">
        {title} · {offers.length}
      </h2>
      <div className="grid gap-2 lg:grid-cols-2">
        {offers.map((offer) => {
          const bank = getBankById(staticData, offer.offer.bankId);

          return (
            <OfferCard
              bankId={offer.offer.bankId}
              bankName={bank?.name ?? offer.offer.bankId}
              key={offer.offer.id}
              offer={offer}
            />
          );
        })}
      </div>
    </section>
  );
}
