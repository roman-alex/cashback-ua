import { useState, type ReactNode } from "react";

import { ResultList } from "@/components/ResultList/ResultList";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { useCashbackData } from "@/hooks/useCashbackData";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";

export function SearchPage() {
  const period = useCurrentPeriod();
  const cashbackData = useCashbackData(period);
  const [query, setQuery] = useState("");

  const searchOutput =
    cashbackData.status === "available"
      ? evaluateSearchResults({
          offers: cashbackData.currentMonthOffers.data.offers,
          staticData: cashbackData.staticData,
          query,
          period,
        })
      : null;
  const hasResults =
    searchOutput !== null && searchOutput.evaluatedOffers.length > 0;

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
        <>
          <SearchInput onChange={setQuery} value={query} />

          {hasResults && searchOutput ? (
            <ResultList
              offers={searchOutput.evaluatedOffers}
              staticData={cashbackData.staticData}
            />
          ) : (
            <EmptyState
              title="Немає збігів"
              text="Спробуйте іншу назву магазину, сервісу або категорії."
            />
          )}
        </>
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
