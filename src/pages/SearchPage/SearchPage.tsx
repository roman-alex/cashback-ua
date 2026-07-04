import { useState, type ReactNode } from "react";

import { ResultList } from "@/components/ResultList/ResultList";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { getDefaultCategoryOffers } from "@/features/offer-evaluation/getDefaultCategoryOffers";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { useCashbackData } from "@/hooks/useCashbackData";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";

export function SearchPage() {
  const period = useCurrentPeriod();
  const cashbackData = useCashbackData(period);
  const [query, setQuery] = useState("");
  const isDefaultMode = query.trim().length === 0;

  const visibleOffers =
    cashbackData.status === "available"
      ? isDefaultMode
        ? getDefaultCategoryOffers({
            offers: cashbackData.currentMonthOffers.data.offers,
            period,
          })
        : evaluateSearchResults({
            offers: cashbackData.currentMonthOffers.data.offers,
            staticData: cashbackData.staticData,
            query,
            period,
          }).evaluatedOffers
      : [];
  const hasResults = visibleOffers.length > 0;

  return (
    <section className="space-y-5">
      {cashbackData.status === "loading" ? (
        <EmptyState
          title="Завантажуємо кешбеки"
          text="Підтягуємо актуальні дані для пошуку."
        />
      ) : cashbackData.status === "error" ? (
        <EmptyState
          title="Не вдалося завантажити дані"
          text="Перевірте підключення або спробуйте оновити сторінку."
        />
      ) : cashbackData.status === "missing" ? (
        <MissingCurrentMonthState
          latestArchivePeriod={
            cashbackData.currentMonthOffers.latestArchivePeriod
          }
          period={period}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
          <h1 className="px-0.5 text-2xl font-semibold leading-8">
            Кешбек та знижки
          </h1>
          <SearchInput onChange={setQuery} value={query} />
          </div>

          {hasResults ? (
            <ResultList
              offers={visibleOffers}
              staticData={cashbackData.staticData}
              title={isDefaultMode ? "Найкращі категорії" : "Знайдено"}
            />
          ) : (
            <EmptyState
              title={isDefaultMode ? "Немає категорій" : "Немає збігів"}
              text={
                isDefaultMode
                  ? "Додайте банківські категорії поточного місяця, щоб показати стартовий список."
                  : "Спробуйте іншу назву магазину, сервісу або категорії."
              }
            />
          )}
        </div>
      )}
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
