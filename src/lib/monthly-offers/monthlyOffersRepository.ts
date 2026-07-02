import { monthlyOffersDataSchema } from "@/schemas/data";
import type { MonthlyOffersData } from "@/types/cashback";

type MonthlyOffersModuleMap = Record<string, unknown>;

export type CurrentMonthOffersResult =
  | {
      status: "available";
      period: string;
      data: MonthlyOffersData;
      latestArchivePeriod: string | null;
    }
  | {
      status: "missing";
      period: string;
      data: null;
      latestArchivePeriod: string | null;
    };

const monthlyOfferModules = import.meta.glob("../../data/offers/*.json", {
  eager: true,
  import: "default",
}) as MonthlyOffersModuleMap;

function getPeriodFromPath(filePath: string): string {
  return filePath.split("/").at(-1)?.replace(".json", "") ?? "";
}

function readMonthlyOfferFiles(): MonthlyOffersData[] {
  return Object.entries(monthlyOfferModules)
    .map(([filePath, moduleValue]) => {
      const parsed = monthlyOffersDataSchema.safeParse(moduleValue);

      if (!parsed.success) {
        return null;
      }

      const period = getPeriodFromPath(filePath);

      if (parsed.data.period !== period) {
        return null;
      }

      return parsed.data;
    })
    .filter((data): data is MonthlyOffersData => data !== null)
    .sort((left, right) => left.period.localeCompare(right.period));
}

const monthlyOfferFiles = readMonthlyOfferFiles();

export function getAllMonthlyOffers(): MonthlyOffersData[] {
  return monthlyOfferFiles;
}

export function getAllMonthlyOfferPeriods(): string[] {
  return monthlyOfferFiles.map((file) => file.period);
}

export function getLatestArchivePeriod(): string | null {
  return monthlyOfferFiles.at(-1)?.period ?? null;
}

export function getMonthlyOffers(period: string): MonthlyOffersData | null {
  return monthlyOfferFiles.find((file) => file.period === period) ?? null;
}

export function getCurrentMonthOffers(
  period: string
): CurrentMonthOffersResult {
  const data = getMonthlyOffers(period);
  const latestArchivePeriod = getLatestArchivePeriod();

  if (data) {
    return {
      status: "available",
      period,
      data,
      latestArchivePeriod,
    };
  }

  return {
    status: "missing",
    period,
    data: null,
    latestArchivePeriod,
  };
}
