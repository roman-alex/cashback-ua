import banksJson from "@/data/banks.json";
import cardsJson from "@/data/cards.json";
import categoriesJson from "@/data/categories.json";
import merchantsJson from "@/data/merchants.json";
import {
  banksSchema,
  cardsSchema,
  categoriesSchema,
  merchantsSchema,
} from "@/schemas/data";
import type { Bank, Card, CashbackCategory, Merchant } from "@/types/cashback";

const banks = banksSchema.parse(banksJson);
const cards = cardsSchema.parse(cardsJson);
const categories = categoriesSchema.parse(categoriesJson);
const merchants = merchantsSchema.parse(merchantsJson);

export function getBanks(): Bank[] {
  return banks;
}

export function getCards(): Card[] {
  return cards;
}

export function getCategories(): CashbackCategory[] {
  return categories;
}

export function getMerchants(): Merchant[] {
  return merchants;
}

export function getBankById(bankId: string): Bank | null {
  return banks.find((bank) => bank.id === bankId) ?? null;
}

export function getCardsByBankId(bankId: string): Card[] {
  return cards.filter((card) => card.bankId === bankId);
}
