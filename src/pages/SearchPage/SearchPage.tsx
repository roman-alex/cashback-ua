import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarDays, Settings } from "lucide-react";

import { OfferDetailsDrawer } from "@/components/OfferDetailsDrawer/OfferDetailsDrawer";
import { ResultGroup } from "@/components/ResultGroup/ResultGroup";
import { SearchFilters, type SearchFilterState } from "@/components/SearchFilters/SearchFilters";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { Button } from "@/components/ui/button";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { getCards } from "@/lib/static-data/staticDataRepository";
import { useMonthlyAppState } from "@/hooks/useMonthlyAppState";
import type { EvaluatedOffer } from "@/types/cashback";

export function SearchPage() {
  const {
    currentMonthOffers,
    currentMonthPreferences,
    period,
    userPreferences,
  } = useMonthlyAppState();
  const [query, setQuery] = useState("");
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<EvaluatedOffer | null>(null);
  const userCards = useMemo(
    () =>
      getCards().filter((card) =>
        userPreferences.selectedCardIds.includes(card.id)
      ),
    [userPreferences.selectedCardIds]
  );
  const [filters, setFilters] = useState<SearchFilterState>({
    bankScope: "all",
    selectedCardIds: userPreferences.selectedCardIds,
    fundingSource: userPreferences.defaultFundingSource,
    channel: userPreferences.defaultChannel,
    activation: "all",
  });

  useEffect(() => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      selectedCardIds: userPreferences.selectedCardIds,
      fundingSource: userPreferences.defaultFundingSource,
      channel: userPreferences.defaultChannel,
    }));
  }, [
    userPreferences.defaultChannel,
    userPreferences.defaultFundingSource,
    userPreferences.selectedCardIds,
  ]);

  const purchaseAmount = parsePurchaseAmount(purchaseAmountInput);
  const effectiveUserPreferences = {
    ...userPreferences,
    selectedCardIds: filters.selectedCardIds,
  };
  const searchOutput =
    currentMonthOffers.status === "available"
      ? evaluateSearchResults({
          offers: currentMonthOffers.data.offers,
          query,
          period,
          userPreferences: effectiveUserPreferences,
          currentMonthPreferences,
          purchaseAmount,
          bankScope: filters.bankScope,
          fundingSource: filters.fundingSource,
          channel: filters.channel,
          activation: filters.activation,
        })
      : null;
  const hasResults =
    searchOutput !== null && searchOutput.evaluatedOffers.length > 0;
  const showMonthlyBanner =
    currentMonthOffers.status === "available" &&
    currentMonthPreferences.offerPreferences.length === 0;

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
          Знайдіть мерчанта, категорію або MCC і порівняйте пропозиції ваших
          карток з іншими банками.
        </p>
      </div>

      {showMonthlyBanner ? (
        <InfoBanner
          actionHref="#/settings"
          actionText="Налаштування"
          text="Новий місяць — позначте підключені кешбеки"
        />
      ) : null}

      {userPreferences.selectedBankIds.length === 0 ? (
        <InfoBanner
          actionHref="#/settings"
          actionText="Додати банки"
          text="Оберіть свої банки, щоб побачити найкращі пропозиції саме для ваших карток."
        />
      ) : null}

      {currentMonthOffers.status === "missing" ? (
        <MissingCurrentMonthState
          latestArchivePeriod={currentMonthOffers.latestArchivePeriod}
          period={period}
        />
      ) : (
        <>
          <div className="space-y-4 rounded-md border border-border bg-card p-4 text-card-foreground md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <SearchInput onChange={setQuery} value={query} />
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">
                  Сума покупки
                </span>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setPurchaseAmountInput(event.target.value)}
                  placeholder="1000"
                  type="number"
                  value={purchaseAmountInput}
                />
              </label>
            </div>
            <SearchFilters
              cards={userCards}
              filters={filters}
              onChange={setFilters}
            />
          </div>

          {hasResults && searchOutput ? (
            <div className="space-y-8">
              <ResultGroup
                description="Готові пропозиції з ваших вибраних карток."
                offers={searchOutput.groups.bestForYou}
                title="Найкраще для вас"
                onOpenDetails={setSelectedOffer}
              />
              <ResultGroup
                description="Потрібно підключити або вибрати категорію перед оплатою."
                offers={searchOutput.groups.availableAfterActivation}
                title="Доступно після підключення"
                onOpenDetails={setSelectedOffer}
              />
              <ResultGroup
                description="Пропозиції інших банків, які можуть бути вигіднішими."
                offers={searchOutput.groups.betterInOtherBanks}
                title="Вигідніше в інших банках"
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

function InfoBanner({
  actionHref,
  actionText,
  text,
}: {
  actionHref: string;
  actionText: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-secondary/50 bg-secondary/15 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 font-medium">
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        {text}
      </p>
      <Button asChild size="sm" type="button" variant="secondary">
        <Link to={actionHref.replace("#", "")}>
          <Settings className="h-4 w-4" aria-hidden="true" />
          {actionText}
        </Link>
      </Button>
    </div>
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
          <Button asChild type="button" variant="secondary">
            <Link to="/archive">Відкрити архів</Link>
          </Button>
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

function parsePurchaseAmount(value: string) {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}
