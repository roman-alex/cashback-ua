import { useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";

import { OfferDetailsDrawer } from "@/components/OfferDetailsDrawer/OfferDetailsDrawer";
import { ResultGroup } from "@/components/ResultGroup/ResultGroup";
import { SearchFilters, type SearchFilterState } from "@/components/SearchFilters/SearchFilters";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";
import { getCurrentMonthOffers } from "@/lib/monthly-offers/monthlyOffersRepository";
import { getBanks } from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";

export function SearchPage() {
  const period = useCurrentPeriod();
  const currentMonthOffers = getCurrentMonthOffers(period);
  const banks = getBanks().filter((bank) => bank.active);
  const [query, setQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<EvaluatedOffer | null>(null);
  const [filters, setFilters] = useState<SearchFilterState>({
    bankId: "all",
    fundingSource: "all",
    channel: "all",
    activation: "all",
  });

  const searchOutput =
    currentMonthOffers.status === "available"
      ? evaluateSearchResults({
          offers: currentMonthOffers.data.offers,
          query,
          period,
          bankId: filters.bankId,
          fundingSource: filters.fundingSource,
          channel: filters.channel,
          activation: filters.activation,
        })
      : null;
  const hasResults =
    searchOutput !== null && searchOutput.evaluatedOffers.length > 0;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatUkrainianPeriod(period)}
        </p>
        <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
          Пошук кешбеків
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Знайдіть мерчанта, категорію або MCC і швидко порівняйте актуальні
          пропозиції банків.
        </p>
      </div>

      {currentMonthOffers.status === "missing" ? (
        <MissingCurrentMonthState
          latestArchivePeriod={currentMonthOffers.latestArchivePeriod}
          period={period}
        />
      ) : (
        <>
          <div className="space-y-4 rounded-md border border-border bg-card p-4 text-card-foreground md:p-5">
            <SearchInput onChange={setQuery} value={query} />
            <SearchFilters
              banks={banks}
              filters={filters}
              onChange={setFilters}
            />
          </div>

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
                description="Решта збігів за поточним запитом і фільтрами."
                offers={searchOutput.groups.otherOffers}
                title="Інші пропозиції"
                onOpenDetails={setSelectedOffer}
              />
            </div>
          ) : (
            <EmptyState
              title="Немає збігів"
              text="Спробуйте Kims, Кімс, Кимс, хімчистка, продукти або 5411."
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
