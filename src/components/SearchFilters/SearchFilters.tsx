import { Button } from "@/components/ui/button";
import type { Bank, FundingSource, PaymentChannel } from "@/types/cashback";

export interface SearchFilterState {
  bankId: "all" | string;
  fundingSource: "all" | FundingSource;
  channel: "all" | PaymentChannel;
  activation: "all" | "automatic" | "requires-action";
}

export function SearchFilters({
  banks,
  filters,
  onChange,
}: {
  banks: Bank[];
  filters: SearchFilterState;
  onChange: (filters: SearchFilterState) => void;
}) {
  function patch(patchValue: Partial<SearchFilterState>) {
    onChange({ ...filters, ...patchValue });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SegmentedControl
          label="Банк"
          options={[
            { label: "Усі", value: "all" },
            ...banks.map((bank) => ({
              label: bank.name,
              value: bank.id,
            })),
          ]}
          value={filters.bankId}
          onChange={(value) => patch({ bankId: value })}
        />
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
          label="Підключення"
          options={[
            { label: "Усі", value: "all" },
            { label: "Авто", value: "automatic" },
            { label: "Потрібна дія", value: "requires-action" },
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
