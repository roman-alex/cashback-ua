import { z } from "zod";

import { monthlyOffersDataSchema } from "@/schemas/data";
import type { MonthlyOffersData } from "@/types/cashback";

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

const baseUrl =
  (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
    ?.BASE_URL ?? "/";
const dataBaseUrl = `${baseUrl}data`;

const offerIndexSchema = z.object({
  periods: z.array(z.string().regex(/^\d{4}-\d{2}$/)).default([]),
});

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${dataBaseUrl}/${path}`);

  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function getAllMonthlyOfferPeriods(): Promise<string[]> {
  const indexJson = await fetchJson("offers/index.json");
  const index = offerIndexSchema.parse(indexJson);

  return [...index.periods].sort();
}

export async function getLatestArchivePeriod(): Promise<string | null> {
  const periods = await getAllMonthlyOfferPeriods();

  return periods.at(-1) ?? null;
}

export async function getMonthlyOffers(
  period: string
): Promise<MonthlyOffersData | null> {
  const periods = await getAllMonthlyOfferPeriods();

  if (!periods.includes(period)) {
    return null;
  }

  return loadMonthlyOffers(period);
}

export async function getCurrentMonthOffers(
  period: string
): Promise<CurrentMonthOffersResult> {
  const periods = await getAllMonthlyOfferPeriods();
  const latestArchivePeriod = periods.at(-1) ?? null;

  if (periods.includes(period)) {
    const data = await loadMonthlyOffers(period);

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

async function loadMonthlyOffers(period: string): Promise<MonthlyOffersData> {
  const monthlyJson = await fetchJson(`offers/${period}.json`);
  const data = monthlyOffersDataSchema.parse(monthlyJson);

  if (data.period !== period) {
    throw new Error(`Offer file period mismatch for ${period}`);
  }

  return data;
}
