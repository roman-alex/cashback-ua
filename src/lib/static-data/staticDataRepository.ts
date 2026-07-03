import {
  banksSchema,
  cardsSchema,
  categoriesSchema,
  merchantsSchema,
} from "@/schemas/data";
import type { Bank, Card, CashbackCategory, Merchant } from "@/types/cashback";

export interface StaticCashbackData {
  banks: Bank[];
  cards: Card[];
  categories: CashbackCategory[];
  merchants: Merchant[];
}

const baseUrl =
  (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
    ?.BASE_URL ?? "/";
const dataBaseUrl = `${baseUrl}data`;

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${dataBaseUrl}/${path}`);

  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function loadStaticCashbackData(): Promise<StaticCashbackData> {
  const [banksJson, cardsJson, categoriesJson, merchantsJson] =
    await Promise.all([
      fetchJson("banks.json"),
      fetchJson("cards.json"),
      fetchJson("categories.json"),
      fetchJson("merchants.json"),
    ]);

  return {
    banks: banksSchema.parse(banksJson),
    cards: cardsSchema.parse(cardsJson),
    categories: categoriesSchema.parse(categoriesJson),
    merchants: merchantsSchema.parse(merchantsJson),
  };
}

export function getBankById(
  staticData: StaticCashbackData,
  bankId: string
): Bank | null {
  return staticData.banks.find((bank) => bank.id === bankId) ?? null;
}

export function getCardsByBankId(
  staticData: StaticCashbackData,
  bankId: string
): Card[] {
  return staticData.cards.filter((card) => card.bankId === bankId);
}
