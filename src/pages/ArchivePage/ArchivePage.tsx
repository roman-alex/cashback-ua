import { useMemo, useState } from "react";
import { Archive, Filter, X } from "lucide-react";

import { OfferDetailsDrawer } from "@/components/OfferDetailsDrawer/OfferDetailsDrawer";
import { Button } from "@/components/ui/button";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import {
  getAllMonthlyOffers,
  getAllMonthlyOfferPeriods,
} from "@/lib/monthly-offers/monthlyOffersRepository";
import {
  getBankById,
  getBanks,
  getCategories,
  getMerchants,
} from "@/lib/static-data/staticDataRepository";
import type {
  ActivationMode,
  CashbackOffer,
  EvaluatedOffer,
  FundingSource,
  OfferType,
  PaymentChannel,
} from "@/types/cashback";

interface ArchiveFilters {
  year: string;
  month: string;
  bankId: string;
  categoryId: string;
  merchantId: string;
  offerType: "all" | OfferType;
  activationMode: "all" | ActivationMode;
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
}

const allValue = "all";
const banks = getBanks();
const categories = getCategories();
const merchants = getMerchants();

export function ArchivePage() {
  const periods = getAllMonthlyOfferPeriods().sort((left, right) =>
    right.localeCompare(left)
  );
  const archiveMonths = getAllMonthlyOffers().sort((left, right) =>
    right.period.localeCompare(left.period)
  );
  const years = uniqueValues(periods.map((period) => period.split("-")[0]));
  const months = uniqueValues(periods.map((period) => period.split("-")[1]));
  const [filters, setFilters] = useState<ArchiveFilters>({
    year: allValue,
    month: allValue,
    bankId: allValue,
    categoryId: allValue,
    merchantId: allValue,
    offerType: allValue,
    activationMode: allValue,
    fundingSource: allValue,
    channel: allValue,
  });
  const [selectedOffer, setSelectedOffer] = useState<EvaluatedOffer | null>(null);
  const filteredOffers = useMemo(
    () =>
      archiveMonths.flatMap((month) =>
        month.offers
          .filter((offer) => matchesArchiveFilters(month.period, offer, filters))
          .map((offer) => ({
            period: month.period,
            offer,
          }))
      ),
    [archiveMonths, filters]
  );
  const groupedOffers = groupArchiveOffersByPeriod(filteredOffers);
  const hasFilters = Object.values(filters).some((value) => value !== allValue);

  function patchFilters(patch: Partial<ArchiveFilters>) {
    setFilters((previousFilters) => ({
      ...previousFilters,
      ...patch,
    }));
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
          Архів
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Історичні кешбеки з місячних JSON-файлів без історичних
          користувацьких активацій.
        </p>
      </div>

      <div className="space-y-4 rounded-md border border-border bg-card p-4 text-card-foreground md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Фільтри
          </h2>
          {hasFilters ? (
            <Button
              onClick={() =>
                setFilters({
                  year: allValue,
                  month: allValue,
                  bankId: allValue,
                  categoryId: allValue,
                  merchantId: allValue,
                  offerType: allValue,
                  activationMode: allValue,
                  fundingSource: allValue,
                  channel: allValue,
                })
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Скинути
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectFilter
            label="Рік"
            onChange={(year) => patchFilters({ year })}
            options={years.map((year) => ({ label: year, value: year }))}
            value={filters.year}
          />
          <SelectFilter
            label="Місяць"
            onChange={(month) => patchFilters({ month })}
            options={months.map((month) => ({
              label: formatMonthNumber(month),
              value: month,
            }))}
            value={filters.month}
          />
          <SelectFilter
            label="Банк"
            onChange={(bankId) => patchFilters({ bankId })}
            options={banks.map((bank) => ({ label: bank.name, value: bank.id }))}
            value={filters.bankId}
          />
          <SelectFilter
            label="Категорія"
            onChange={(categoryId) => patchFilters({ categoryId })}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            value={filters.categoryId}
          />
          <SelectFilter
            label="Мерчант"
            onChange={(merchantId) => patchFilters({ merchantId })}
            options={merchants.map((merchant) => ({
              label: merchant.name,
              value: merchant.id,
            }))}
            value={filters.merchantId}
          />
          <SelectFilter
            label="Тип"
            onChange={(offerType) =>
              patchFilters({ offerType: offerType as ArchiveFilters["offerType"] })
            }
            options={[
              { label: "Категорія", value: "category" },
              { label: "Партнер", value: "partner" },
              { label: "Базовий", value: "base" },
              { label: "Персональний", value: "personal" },
              { label: "Welcome", value: "welcome" },
              { label: "Special", value: "special" },
            ]}
            value={filters.offerType}
          />
          <SelectFilter
            label="Активація"
            onChange={(activationMode) =>
              patchFilters({
                activationMode:
                  activationMode as ArchiveFilters["activationMode"],
              })
            }
            options={[
              { label: "Автоматично", value: "automatic" },
              { label: "Вручну", value: "manual" },
              { label: "Вибір категорії", value: "category-selection" },
              { label: "Персональна", value: "personal-confirmation" },
              { label: "Реєстрація", value: "registration" },
            ]}
            value={filters.activationMode}
          />
          <SelectFilter
            label="Кошти"
            onChange={(fundingSource) =>
              patchFilters({
                fundingSource:
                  fundingSource as ArchiveFilters["fundingSource"],
              })
            }
            options={[
              { label: "Власні", value: "own" },
              { label: "Кредитні", value: "credit" },
            ]}
            value={filters.fundingSource}
          />
          <SelectFilter
            label="Канал"
            onChange={(channel) =>
              patchFilters({ channel: channel as ArchiveFilters["channel"] })
            }
            options={[
              { label: "Онлайн", value: "online" },
              { label: "Офлайн", value: "offline" },
            ]}
            value={filters.channel}
          />
        </div>
      </div>

      {periods.length === 0 ? (
        <EmptyArchiveState
          title="Архів порожній"
          text="Додайте місячний JSON-файл у src/data/offers."
        />
      ) : groupedOffers.length === 0 ? (
        <EmptyArchiveState
          title="Немає пропозицій за фільтрами"
          text="Скиньте частину фільтрів або виберіть інший місяць."
        />
      ) : (
        <div className="space-y-6">
          {groupedOffers.map((group) => (
            <section key={group.period} className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {formatUkrainianPeriod(group.period)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {group.offers.length} пропозицій
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {group.offers.map(({ offer, period }) => (
                  <ArchiveOfferCard
                    key={offer.id}
                    offer={offer}
                    period={period}
                    onOpenDetails={() =>
                      setSelectedOffer(createArchiveEvaluatedOffer(offer))
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <OfferDetailsDrawer
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </section>
  );
}

function SelectFilter({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <select
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value={allValue}>Усі</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ArchiveOfferCard({
  offer,
  onOpenDetails,
  period,
}: {
  offer: CashbackOffer;
  onOpenDetails: () => void;
  period: string;
}) {
  const bank = getBankById(offer.bankId);

  return (
    <article className="space-y-4 rounded-md border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {bank?.name ?? offer.bankId}
            </span>
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {getActivationModeLabel(offer.activation.mode)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{offer.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatUkrainianPeriod(period)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold">{formatOfferReward(offer)}</p>
          {offer.reward.maxAmount !== null ? (
            <p className="text-sm text-muted-foreground">
              ліміт {formatMoney(offer.reward.maxAmount)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {offer.fundingSources.map((source) => (
          <span key={source} className="rounded-md bg-muted px-2 py-1">
            {source === "own" ? "Власні кошти" : "Кредитні кошти"}
          </span>
        ))}
        {offer.channels.map((channel) => (
          <span key={channel} className="rounded-md bg-muted px-2 py-1">
            {channel === "online" ? "Онлайн" : "Офлайн"}
          </span>
        ))}
        {offer.mccCodes.map((mcc) => (
          <span key={mcc} className="rounded-md bg-muted px-2 py-1">
            MCC {mcc}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Дані перевірено {offer.source.verifiedAt}
        </p>
        <Button onClick={onOpenDetails} size="sm" type="button" variant="ghost">
          Деталі
        </Button>
      </div>
    </article>
  );
}

function EmptyArchiveState({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-5 text-card-foreground">
      <Archive className="h-6 w-6 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function matchesArchiveFilters(
  period: string,
  offer: CashbackOffer,
  filters: ArchiveFilters
) {
  const [year, month] = period.split("-");

  return (
    (filters.year === allValue || filters.year === year) &&
    (filters.month === allValue || filters.month === month) &&
    (filters.bankId === allValue || filters.bankId === offer.bankId) &&
    (filters.categoryId === allValue ||
      offer.categoryIds.includes(filters.categoryId)) &&
    (filters.merchantId === allValue ||
      offer.merchantIds.includes(filters.merchantId)) &&
    (filters.offerType === allValue || filters.offerType === offer.type) &&
    (filters.activationMode === allValue ||
      filters.activationMode === offer.activation.mode) &&
    (filters.fundingSource === allValue ||
      offer.fundingSources.includes(filters.fundingSource)) &&
    (filters.channel === allValue || offer.channels.includes(filters.channel))
  );
}

function groupArchiveOffersByPeriod(
  offers: Array<{ period: string; offer: CashbackOffer }>
) {
  const groups = new Map<string, Array<{ period: string; offer: CashbackOffer }>>();

  for (const offer of offers) {
    groups.set(offer.period, [...(groups.get(offer.period) ?? []), offer]);
  }

  return [...groups.entries()].map(([period, groupOffers]) => ({
    period,
    offers: groupOffers,
  }));
}

function createArchiveEvaluatedOffer(offer: CashbackOffer): EvaluatedOffer {
  const activationStatus =
    offer.activation.mode === "automatic" ? "automatic" : "unknown";

  return {
    offer,
    belongsToUser: false,
    ownsEligibleCard: false,
    isCurrentlyValid: true,
    isActivated: activationStatus === "automatic",
    isApplicable: true,
    activationStatus,
    expectedReward: null,
    match: {
      type: "text",
      score: 0,
    },
    missingRequirements: [],
  };
}

function formatOfferReward(offer: CashbackOffer) {
  if (offer.reward.type === "fixed") {
    return formatMoney(offer.reward.value);
  }

  return `${offer.reward.value}%`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    currency: "UAH",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function getActivationModeLabel(mode: ActivationMode) {
  const labels = {
    automatic: "Автоматично",
    manual: "Потрібно підключити",
    "category-selection": "Вибір категорії",
    "personal-confirmation": "Персональна",
    registration: "Реєстрація",
  };

  return labels[mode];
}

function formatMonthNumber(month: string) {
  return formatUkrainianPeriod(`2026-${month}`).replace("2026 р.", "").trim();
}

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}
