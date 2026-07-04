import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ListFilter } from "lucide-react";

import { ResultList } from "@/components/ResultList/ResultList";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { evaluateSearchResults } from "@/features/offer-evaluation/evaluateSearchResults";
import { getDefaultCategoryOffers } from "@/features/offer-evaluation/getDefaultCategoryOffers";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import { cn } from "@/lib/utils";
import { useCashbackData } from "@/hooks/useCashbackData";
import { useCurrentPeriod } from "@/hooks/useCurrentPeriod";
import type { Bank } from "@/types/cashback";

const bankFilterStorageKey = "cashback-ua-disabled-bank-ids";

export function SearchPage() {
  const period = useCurrentPeriod();
  const cashbackData = useCashbackData(period);
  const [query, setQuery] = useState("");
  const [isBankFilterOpen, setIsBankFilterOpen] = useState(false);
  const [disabledBankIds, setDisabledBankIds] = useStoredDisabledBankIds();
  const isDefaultMode = query.trim().length === 0;
  const enabledBankIds = useMemo(() => {
    if (cashbackData.status !== "available") {
      return new Set<string>();
    }

    return new Set(
      cashbackData.staticData.banks
        .filter((bank) => !disabledBankIds.includes(bank.id))
        .map((bank) => bank.id)
    );
  }, [cashbackData, disabledBankIds]);
  const filteredOffers =
    cashbackData.status === "available"
      ? cashbackData.currentMonthOffers.data.offers.filter((offer) =>
          enabledBankIds.has(offer.bankId)
        )
      : [];

  const visibleOffers =
    cashbackData.status === "available"
      ? isDefaultMode
        ? getDefaultCategoryOffers({
            offers: filteredOffers,
            period,
          })
        : evaluateSearchResults({
            offers: filteredOffers,
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
            <div className="flex items-center gap-2">
              <SearchInput
                className="min-w-0 flex-1"
                onChange={setQuery}
                value={query}
              />
              <button
                aria-expanded={isBankFilterOpen}
                aria-label="Фільтр банків"
                className={cn(
                  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isBankFilterOpen && "border-transparent text-primary ring-2 ring-ring"
                )}
                onClick={() => setIsBankFilterOpen((isOpen) => !isOpen)}
                type="button"
              >
                <ListFilter className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {isBankFilterOpen ? (
              <BankFilterPanel
                banks={cashbackData.staticData.banks}
                disabledBankIds={disabledBankIds}
                onToggleBank={(bankId) =>
                  setDisabledBankIds((currentBankIds) =>
                    currentBankIds.includes(bankId)
                      ? currentBankIds.filter((id) => id !== bankId)
                      : [...currentBankIds, bankId]
                  )
                }
              />
            ) : null}
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

function BankFilterPanel({
  banks,
  disabledBankIds,
  onToggleBank,
}: {
  banks: Bank[];
  disabledBankIds: string[];
  onToggleBank: (bankId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-md border border-border bg-card p-1.5">
      {banks
        .filter((bank) => bank.active)
        .map((bank) => {
          const isEnabled = !disabledBankIds.includes(bank.id);

          return (
            <button
              className={cn(
                "flex h-8 items-center justify-center rounded px-2 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              key={bank.id}
              onClick={() => onToggleBank(bank.id)}
              type="button"
            >
              {getBankFilterLabel(bank)}
            </button>
          );
        })}
    </div>
  );
}

function useStoredDisabledBankIds() {
  const [disabledBankIds, setDisabledBankIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem(bankFilterStorageKey);
      const parsedValue = storedValue ? JSON.parse(storedValue) : [];

      return Array.isArray(parsedValue)
        ? parsedValue.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      bankFilterStorageKey,
      JSON.stringify(disabledBankIds)
    );
  }, [disabledBankIds]);

  return [disabledBankIds, setDisabledBankIds] as const;
}

function getBankFilterLabel(bank: Bank) {
  switch (bank.id) {
    case "abank":
      return "Abank";
    case "monobank":
      return "Mono";
    case "privatbank":
      return "Privat";
    case "pumb":
      return "Pumb";
    case "raiffeisen":
      return "Raif";
    default:
      return bank.name;
  }
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
