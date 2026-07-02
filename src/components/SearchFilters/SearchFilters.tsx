import { Check, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Card, FundingSource, PaymentChannel } from "@/types/cashback";
import { cn } from "@/lib/utils";

export interface SearchFilterState {
  bankScope: "my" | "all";
  selectedCardIds: string[];
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "ready-to-use" | "requires-activation";
}

export function SearchFilters({
  cards,
  filters,
  onChange,
}: {
  cards: Card[];
  filters: SearchFilterState;
  onChange: (filters: SearchFilterState) => void;
}) {
  function patch(patchValue: Partial<SearchFilterState>) {
    onChange({ ...filters, ...patchValue });
  }

  function toggleCard(cardId: string) {
    const nextCardIds = filters.selectedCardIds.includes(cardId)
      ? filters.selectedCardIds.filter((id) => id !== cardId)
      : [...filters.selectedCardIds, cardId];

    patch({ selectedCardIds: nextCardIds });
  }

  return (
    <div className="space-y-4">
      <SegmentedControl
        label="Банки"
        options={[
          { label: "Мої банки", value: "my" },
          { label: "Усі банки", value: "all" },
        ]}
        value={filters.bankScope}
        onChange={(value) => patch({ bankScope: value })}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Картки</p>
        {cards.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            Виберіть картки в налаштуваннях.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cards.map((card) => {
              const checked = filters.selectedCardIds.includes(card.id);

              return (
                <button
                  key={card.id}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-accent"
                  )}
                  onClick={() => toggleCard(card.id)}
                  type="button"
                >
                  {checked ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                  )}
                  {card.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SegmentedControl
          label="Кошти"
          options={[
            { label: "Усі", value: "all" },
            { label: "Власні", value: "own" },
            { label: "Кредитні", value: "credit" },
          ]}
          value={filters.fundingSource}
          onChange={(value) => patch({ fundingSource: value })}
        />
        <SegmentedControl
          label="Оплата"
          options={[
            { label: "Усі", value: "all" },
            { label: "Онлайн", value: "online" },
            { label: "Офлайн", value: "offline" },
          ]}
          value={filters.channel}
          onChange={(value) => patch({ channel: value })}
        />
        <SegmentedControl
          label="Статус"
          options={[
            { label: "Усі", value: "all" },
            { label: "Готові", value: "ready-to-use" },
            { label: "Підключити", value: "requires-activation" },
          ]}
          value={filters.activation}
          onChange={(value) => patch({ activation: value })}
        />
      </div>
    </div>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
  value: TValue;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 sm:flex">
        {options.map((option) => (
          <Button
            key={option.value}
            className="min-h-9 flex-1 px-2"
            onClick={() => onChange(option.value)}
            type="button"
            variant={value === option.value ? "default" : "ghost"}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
