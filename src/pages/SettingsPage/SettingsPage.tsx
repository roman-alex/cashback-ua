import {
  BadgeCheck,
  Ban,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  Landmark,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatUkrainianPeriod } from "@/lib/dates/period";
import {
  getBanks,
  getCards,
  getCardsByBankId,
} from "@/lib/static-data/staticDataRepository";
import { cn } from "@/lib/utils";
import { useMonthlyAppState } from "@/hooks/useMonthlyAppState";
import type { CashbackOffer } from "@/types/cashback";
import type { CurrentMonthOfferStatus } from "@/types/preferences";

const banks = getBanks().filter((bank) => bank.active);

export function SettingsPage() {
  const {
    period,
    currentMonthOffers,
    userPreferences,
    currentMonthPreferences,
    updateUserPreferences,
    setOfferStatus,
    clearOfferStatus,
  } = useMonthlyAppState();
  const selectedBankIds = new Set(userPreferences.selectedBankIds);
  const selectedCardIds = new Set(userPreferences.selectedCardIds);
  const selectedBanks = banks.filter((bank) => selectedBankIds.has(bank.id));
  const visibleBanks = selectedBanks.length > 0 ? selectedBanks : banks;
  const currentOfferStatus = new Map(
    currentMonthPreferences.offerPreferences.map((preference) => [
      preference.offerId,
      preference.status,
    ])
  );
  const showMonthlyBanner =
    currentMonthOffers.status === "available" &&
    currentMonthPreferences.offerPreferences.length === 0;

  function toggleBank(bankId: string) {
    const nextBankIds = toggleValue(userPreferences.selectedBankIds, bankId);
    const nextBankIdSet = new Set(nextBankIds);
    const nextSelectedCardIds = userPreferences.selectedCardIds.filter(
      (cardId) => {
        const card = getCards().find((candidate) => candidate.id === cardId);

        if (!card) {
          return true;
        }

        return nextBankIdSet.size === 0 || nextBankIdSet.has(card.bankId);
      }
    );

    updateUserPreferences({
      selectedBankIds: nextBankIds,
      selectedCardIds: nextSelectedCardIds,
    });
  }

  function toggleCard(cardId: string) {
    updateUserPreferences({
      selectedCardIds: toggleValue(userPreferences.selectedCardIds, cardId),
    });
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatUkrainianPeriod(period)}
        </p>
        <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
          Налаштування
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Оберіть свої банки й картки, а потім позначте кешбеки, які вже
          підключені на поточний місяць.
        </p>
      </div>

      {showMonthlyBanner ? (
        <div className="flex items-start gap-3 rounded-md border border-secondary/50 bg-secondary/15 p-4 text-secondary-foreground">
          <ListChecks className="mt-0.5 h-5 w-5" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              Новий місяць — позначте підключені кешбеки
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Налаштування активацій застосовуються тільки до{" "}
              {formatUkrainianPeriod(period)}.
            </p>
          </div>
        </div>
      ) : null}

      <SettingsSection
        description="Вибрані банки визначають, які картки та пропозиції показувати як ваші."
        icon={Landmark}
        title="Мої банки"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {banks.map((bank) => (
            <ToggleRow
              key={bank.id}
              checked={selectedBankIds.has(bank.id)}
              description={bank.active ? "Активний банк" : "Неактивний банк"}
              label={bank.name}
              onChange={() => toggleBank(bank.id)}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        description="Картки згруповані за вибраними банками. Якщо банк не вибрано, показуємо всі картки для швидкого старту."
        icon={CreditCard}
        title="Мої картки"
      >
        <div className="space-y-4">
          {visibleBanks.map((bank) => {
            const cards = getCardsByBankId(bank.id).filter((card) => card.active);

            if (cards.length === 0) {
              return null;
            }

            return (
              <div key={bank.id} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {bank.name}
                </h3>
                <div className="grid gap-3">
                  {cards.map((card) => (
                    <ToggleRow
                      key={card.id}
                      checked={selectedCardIds.has(card.id)}
                      description={[
                        card.supportsOwnFunds ? "власні кошти" : null,
                        card.supportsCreditFunds ? "кредитні кошти" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      disabled={
                        selectedBankIds.size > 0 && !selectedBankIds.has(bank.id)
                      }
                      label={card.name}
                      onChange={() => toggleCard(card.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        description="Автоматичні пропозиції активні без дії. Інші можна позначити як підключені; персональні також можна відмітити як недоступні."
        icon={ListChecks}
        title="Кешбеки місяця"
      >
        {currentMonthOffers.status === "missing" ? (
          <EmptyState
            title="Немає даних за поточний місяць"
            text={
              currentMonthOffers.latestArchivePeriod
                ? `Останній доступний архів: ${formatUkrainianPeriod(
                    currentMonthOffers.latestArchivePeriod
                  )}.`
                : "Архівних місяців ще немає."
            }
          />
        ) : (
          <MonthlyOffersSettings
            offers={currentMonthOffers.data.offers}
            selectedBankIds={selectedBankIds}
            selectedCardIds={selectedCardIds}
            statuses={currentOfferStatus}
            onClearOfferStatus={clearOfferStatus}
            onSetOfferStatus={setOfferStatus}
          />
        )}
      </SettingsSection>
    </section>
  );
}

function SettingsSection({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-6 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  checked,
  description,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 transition-colors",
        checked && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input",
          checked && "border-primary bg-primary text-primary-foreground"
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      </span>
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        onChange={onChange}
        type="checkbox"
      />
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function MonthlyOffersSettings({
  offers,
  onClearOfferStatus,
  onSetOfferStatus,
  selectedBankIds,
  selectedCardIds,
  statuses,
}: {
  offers: CashbackOffer[];
  onClearOfferStatus: (offerId: string) => void;
  onSetOfferStatus: (offerId: string, status: CurrentMonthOfferStatus) => void;
  selectedBankIds: Set<string>;
  selectedCardIds: Set<string>;
  statuses: Map<string, CurrentMonthOfferStatus>;
}) {
  const visibleBanks = banks.filter((bank) =>
    selectedBankIds.size > 0 ? selectedBankIds.has(bank.id) : true
  );
  const visibleOffers = offers.filter((offer) =>
    selectedBankIds.size > 0 ? selectedBankIds.has(offer.bankId) : true
  );

  if (visibleOffers.length === 0) {
    return (
      <EmptyState
        title="Немає пропозицій для вибраних банків"
        text="Оберіть інший банк або додайте дані для поточного місяця."
      />
    );
  }

  return (
    <div className="space-y-5">
      {visibleBanks.map((bank) => {
        const bankOffers = offers.filter((offer) => offer.bankId === bank.id);

        if (bankOffers.length === 0) {
          return null;
        }

        return (
          <div key={bank.id} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              {bank.name}
            </h3>
            <div className="grid gap-3">
              {bankOffers.map((offer) => (
                <OfferActivationRow
                  key={offer.id}
                  offer={offer}
                  ownsEligibleCard={
                    selectedCardIds.size === 0
                      ? false
                      : offer.cardIds.some((cardId) => selectedCardIds.has(cardId))
                  }
                  status={statuses.get(offer.id)}
                  onClear={() => onClearOfferStatus(offer.id)}
                  onSetStatus={(status) => onSetOfferStatus(offer.id, status)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OfferActivationRow({
  offer,
  onClear,
  onSetStatus,
  ownsEligibleCard,
  status,
}: {
  offer: CashbackOffer;
  onClear: () => void;
  onSetStatus: (status: CurrentMonthOfferStatus) => void;
  ownsEligibleCard: boolean;
  status: CurrentMonthOfferStatus | undefined;
}) {
  const isAutomatic = offer.activation.mode === "automatic";
  const badge = getActivationBadge(offer, status);
  const isPersonal = offer.activation.mode === "personal-confirmation";

  return (
    <article
      className={cn(
        "space-y-3 rounded-md border border-border bg-background p-4",
        ownsEligibleCard && "border-primary/50"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{offer.title}</h4>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                badge.className
              )}
            >
              <badge.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatReward(offer)} · {formatChannels(offer)} ·{" "}
            {formatFundingSources(offer)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ownsEligibleCard
              ? "Є вибрана картка для цієї пропозиції"
              : "Виберіть відповідну картку, щоб бачити пропозицію як свою"}
          </p>
        </div>
      </div>

      {isAutomatic ? (
        <p className="text-sm text-muted-foreground">
          Пропозиція активна автоматично та не створює запис у localStorage.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onSetStatus("activated")}
            size="sm"
            type="button"
            variant={status === "activated" ? "default" : "secondary"}
          >
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Підключено
          </Button>
          {isPersonal ? (
            <Button
              onClick={() => onSetStatus("not-available")}
              size="sm"
              type="button"
              variant={status === "not-available" ? "default" : "secondary"}
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              Недоступно
            </Button>
          ) : null}
          {status ? (
            <Button onClick={onClear} size="sm" type="button" variant="ghost">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Скинути
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}

function EmptyState({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-background p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getActivationBadge(
  offer: CashbackOffer,
  status: CurrentMonthOfferStatus | undefined
) {
  if (offer.activation.mode === "automatic") {
    return {
      label: "Автоматично",
      icon: BadgeCheck,
      className: "bg-primary/10 text-primary",
    };
  }

  if (status === "activated") {
    return {
      label: "Підключено",
      icon: BadgeCheck,
      className: "bg-primary/10 text-primary",
    };
  }

  if (status === "not-available") {
    return {
      label: "Недоступно",
      icon: Ban,
      className: "bg-muted text-muted-foreground",
    };
  }

  const labels = {
    manual: "Потрібно підключити",
    "category-selection": "Виберіть категорію",
    "personal-confirmation": "Персональна пропозиція",
    registration: "Потрібна реєстрація",
  } as const;

  return {
    label: labels[offer.activation.mode],
    icon: ListChecks,
    className: "bg-secondary/20 text-secondary-foreground",
  };
}

function formatReward(offer: CashbackOffer) {
  if (offer.reward.type === "fixed") {
    return `${offer.reward.value} грн`;
  }

  return `${offer.reward.value}% кешбек`;
}

function formatChannels(offer: CashbackOffer) {
  const labels = {
    online: "онлайн",
    offline: "офлайн",
  };

  return offer.channels.map((channel) => labels[channel]).join(" / ");
}

function formatFundingSources(offer: CashbackOffer) {
  const labels = {
    own: "власні кошти",
    credit: "кредитні кошти",
  };

  return offer.fundingSources.map((source) => labels[source]).join(" / ");
}
