import { useState, type ReactNode } from "react";

import { OfferDetailsDrawer } from "@/components/OfferDetailsDrawer/OfferDetailsDrawer";
import { ResultGroup } from "@/components/ResultGroup/ResultGroup";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";
import { getCurrentMonthOffers } from "@/lib/monthly-offers/monthlyOffersRepository";
import type { EvaluatedOffer } from "@/types/cashback";

export function SearchPage() {
  const period = useCurrentPeriod();
  const currentMonthOffers = getCurrentMonthOffers(period);
  const [query, setQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<EvaluatedOffer | null>(null);

  const searchOutput =
    currentMonthOffers.status === "available"
      ? evaluateSearchResults({
          offers: currentMonthOffers.data.offers,
          query,
          period,
        })
      : null;
  const hasResults =
    searchOutput !== null && searchOutput.evaluatedOffers.length > 0;

  return (
    <section className="space-y-5">
      {currentMonthOffers.status === "missing" ? (
        <MissingCurrentMonthState
          latestArchivePeriod={currentMonthOffers.latestArchivePeriod}
          period={period}
        />
      ) : (
        <>
          <SearchInput onChange={setQuery} value={query} />

          {hasResults && searchOutput ? (
            <div className="space-y-8">
              <ResultGroup
                description="Автоматичні пропозиції, які не потребують ручного підключення."
                offers={searchOutput.groups.bestMatches}
                title="Найкращі збіги"
                onOpenDetails={setSelectedOffer}
              />
              <ResultGroup
                description="Потрібно підключити або вибрати категорію перед оплатою."
                offers={searchOutput.groups.needsActivation}
                title="Доступно після підключення"
                onOpenDetails={setSelectedOffer}
              />
              <ResultGroup
                collapsedByDefault
                description="Решта збігів за поточним запитом."
                offers={searchOutput.groups.otherOffers}
                title="Інші пропозиції"
                onOpenDetails={setSelectedOffer}
              />
            </div>
          ) : (
            <EmptyState
              title="Немає збігів"
              text="Спробуйте Kims, Кімс, Кимс, хімчистка або продукти."
            />
          )}
        </>
      )}

      <OfferDetailsDrawer
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </section>
  );
}

function MissingCurrentMonthState({
  latestArchivePeriod,
  period,
}: {
  latestArchivePeriod: string | null;
  period: string;
}) {
  return (
    <EmptyState
      title={`Немає даних за ${formatUkrainianPeriod(period)}`}
      text={
        latestArchivePeriod
          ? `Поточні пропозиції не підставляються з минулого місяця. Останній архів: ${formatUkrainianPeriod(
              latestArchivePeriod
            )}.`
          : "Додайте JSON-файл поточного місяця, щоб увімкнути пошук."
      }
      action={
        latestArchivePeriod ? (
          <p className="text-sm text-muted-foreground">
            Останній доступний місяць лишається в JSON-даних для майбутнього
            архіву.
          </p>
        ) : null
      }
    />
  );
}

function EmptyState({
  action,
  text,
  title,
}: {
  action?: ReactNode;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-5 text-card-foreground">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
