import {
  Bed,
  BookOpen,
  BriefcaseMedical,
  Brush,
  Bus,
  Car,
  Clapperboard,
  Dumbbell,
  Flower2,
  Fuel,
  Gamepad2,
  Gift,
  Home,
  PawPrint,
  Plane,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Tags,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { EvaluatedOffer } from "@/types/cashback";

/* eslint-disable react-refresh/only-export-components */
export function OfferCard({
  bankId,
  bankName,
  offer,
}: {
  bankId: string;
  bankName: string;
  offer: EvaluatedOffer;
}) {
  const bankBadge = getBankBadge(bankId, bankName);
  const categoryBadge = getCategoryBadge(offer.offer.categoryIds[0]);
  const CategoryIcon = categoryBadge.icon;
  const subtitle = getOfferSubtitle(offer, bankBadge.label);

  return (
    <article className="flex w-full items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-card-foreground">
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${categoryBadge.className}`}
        aria-hidden="true"
      >
        <CategoryIcon className="h-6 w-6" strokeWidth={2.4} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-base font-semibold leading-5">
          {offer.offer.title}
        </span>
        <span className="mt-0.5 block break-words text-sm leading-5 text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
        <span className="text-lg font-semibold leading-none">
          {formatRewardValue(offer)}
        </span>
        <span
          className={`inline-flex w-[45px] justify-center rounded-sm px-1 py-0.5 text-[10px] font-semibold leading-none text-white ${bankBadge.className}`}
        >
          {bankBadge.label}
        </span>
      </span>
    </article>
  );
}

interface CategoryBadge {
  className: string;
  icon: LucideIcon;
}

export function formatRewardValue(offer: EvaluatedOffer) {
  if (offer.offer.reward.type === "fixed") {
    return formatMoney(offer.offer.reward.value);
  }

  return `${offer.offer.reward.value}%`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    currency: "UAH",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function getOfferSubtitle(offer: EvaluatedOffer, bankName: string) {
  if (offer.offer.description.trim().length > 0) {
    return offer.offer.description
      .replace(/^Партнерський кешбек\s+\S+\s+за\s+/i, "")
      .replace(/^Кешбек\s+\S+\s+за\s+/i, "")
      .replace(/^Кешбек за категорію\s+/i, "Категорія ")
      .replace(/\s+в липні 2026.*$/i, "")
      .replace(/\s+Категорію потрібно.*$/i, "")
      .replace(/\.$/, "");
  }

  return bankName;
}

function getBankBadge(bankId: string, bankName: string) {
  switch (bankId) {
    case "abank":
      return {
        className: "bg-green-600",
        label: "abank",
      };
    case "kasta":
      return {
        className: "bg-orange-600",
        label: "Kasta",
      };
    case "monobank":
      return {
        className: "bg-cyan-600",
        label: "mono",
      };
    case "pumb":
      return {
        className: "bg-red-600",
        label: "Pumb",
      };
    case "privatbank":
      return {
        className: "bg-green-600",
        label: "Privat",
      };
    case "raiffeisen":
      return {
        className: "bg-yellow-600",
        label: "Raif",
      };
    case "sense":
      return {
        className: "bg-violet-600",
        label: "Sense",
      };
    default:
      return {
        className: "bg-slate-600",
        label: bankName,
      };
  }
}

function getCategoryBadge(categoryId: string | undefined): CategoryBadge {
  switch (categoryId) {
    case "air-tickets":
      return { className: "bg-blue-600", icon: Plane };
    case "beauty":
      return { className: "bg-pink-500", icon: Brush };
    case "books":
      return { className: "bg-rose-500", icon: BookOpen };
    case "cinema":
      return { className: "bg-red-500", icon: Clapperboard };
    case "clothing":
    case "shoes":
      return { className: "bg-orange-500", icon: Shirt };
    case "duty-free":
      return { className: "bg-blue-500", icon: ShoppingBag };
    case "electronics":
    case "gadgets-payment":
      return { className: "bg-sky-500", icon: Smartphone };
    case "entertainment":
      return { className: "bg-green-500", icon: Gift };
    case "fitness":
    case "sports":
      return { className: "bg-orange-600", icon: Dumbbell };
    case "flowers":
      return { className: "bg-blue-700", icon: Flower2 };
    case "fuel":
      return { className: "bg-emerald-600", icon: Fuel };
    case "gaming":
      return { className: "bg-indigo-500", icon: Gamepad2 };
    case "hardware-stores":
      return { className: "bg-teal-500", icon: Wrench };
    case "hotels":
      return { className: "bg-amber-700", icon: Bed };
    case "medical":
    case "pharmacies":
      return { className: "bg-cyan-500", icon: BriefcaseMedical };
    case "multimarkets":
      return { className: "bg-purple-500", icon: Sparkles };
    case "pets":
      return { className: "bg-teal-500", icon: PawPrint };
    case "products":
      return { className: "bg-lime-500", icon: Store };
    case "restaurants":
      return { className: "bg-yellow-500", icon: Utensils };
    case "taxi":
      return { className: "bg-amber-500", icon: Car };
    case "toys":
      return { className: "bg-fuchsia-500", icon: Gift };
    case "transport":
      return { className: "bg-violet-600", icon: Bus };
    case "utilities":
      return { className: "bg-slate-500", icon: Home };
    default:
      return { className: "bg-slate-600", icon: Tags };
  }
}
