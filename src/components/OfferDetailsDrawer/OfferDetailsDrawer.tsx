import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  getCategories,
  getMerchants,
  getCards,
  getBankById,
} from "@/lib/static-data/staticDataRepository";
import type { EvaluatedOffer } from "@/types/cashback";
import {
  ActivationBadge,
  formatMoney,
  formatRewardValue,
} from "@/components/OfferCard/OfferCard";

export function OfferDetailsDrawer({
  offer,
  onClose,
}: {
  offer: EvaluatedOffer | null;
  onClose: () => void;
}) {
  if (!offer) {
    return null;
  }

  const bank = getBankById(offer.offer.bankId);
  const cards = getCards().filter((card) => offer.offer.cardIds.includes(card.id));
  const merchants = getMerchants().filter((merchant) =>
    offer.offer.merchantIds.includes(merchant.id)
  );
  const categories = getCategories().filter((category) =>
    offer.offer.categoryIds.includes(category.id)
  );

  return (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-md border border-border bg-card p-4 text-card-foreground shadow-xl md:inset-y-0 md:left-auto md:right-0 md:w-[420px] md:rounded-none md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {bank?.name ?? offer.offer.bankId}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{offer.offer.title}</h2>
          </div>
          <Button
            aria-label="Закрити деталі"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ActivationBadge status={offer.activationStatus} />
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
            {formatRewardValue(offer)}
          </span>
          {offer.expectedReward !== null ? (
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Очікувано {formatMoney(offer.expectedReward)}
            </span>
          ) : null}
        </div>

        <div className="mt-6 space-y-5 text-sm">
          <DetailBlock title="Опис">{offer.offer.description}</DetailBlock>
          <DetailBlock title="Мерчанти">
            {merchants.length > 0
              ? merchants.map((merchant) => merchant.name).join(", ")
              : "Не обмежено конкретним мерчантом"}
          </DetailBlock>
          <DetailBlock title="Категорії">
            {categories.map((category) => category.name).join(", ")}
          </DetailBlock>
          <DetailBlock title="MCC">
            {offer.offer.mccCodes.length > 0
              ? offer.offer.mccCodes.join(", ")
              : "MCC залежить від мерчанта"}
          </DetailBlock>
          <DetailBlock title="Картки">
            {cards.map((card) => card.name).join(", ")}
          </DetailBlock>
          <DetailBlock title="Умови">
            {[
              offer.offer.conditions.minPurchaseAmount !== null
                ? `Мінімальна покупка ${formatMoney(
                    offer.offer.conditions.minPurchaseAmount
                  )}`
                : "Без мінімальної покупки",
              offer.offer.conditions.firstPurchaseOnly
                ? "Тільки перша покупка"
                : null,
              offer.offer.conditions.newCustomerOnly
                ? "Тільки нові клієнти"
                : null,
              ...offer.offer.conditions.notes,
            ]
              .filter(Boolean)
              .join(". ")}
          </DetailBlock>
          <DetailBlock title="Підключення">
            {offer.offer.activation.instructions ?? "Дія не потрібна"}
          </DetailBlock>
          <DetailBlock title="Платіжні системи">
            {offer.offer.conditions.paymentSystems.length > 0
              ? offer.offer.conditions.paymentSystems.join(", ")
              : "Visa та Mastercard"}
          </DetailBlock>
          <DetailBlock title="Джерело">
            {offer.offer.source.url ? (
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={offer.offer.source.url}
                rel="noreferrer"
                target="_blank"
              >
                Дані перевірено {offer.offer.source.verifiedAt}
              </a>
            ) : (
              `Дані перевірено ${offer.offer.source.verifiedAt}`
            )}
          </DetailBlock>
          <DetailBlock title="MCC warning">
            Фактичний MCC залежить від термінала або платіжного провайдера
            мерчанта.
          </DetailBlock>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-1 text-muted-foreground">{children}</div>
    </div>
  );
}
