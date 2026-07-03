import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import {
  banksSchema,
  cardsSchema,
  categoriesSchema,
  merchantsSchema,
  monthlyOffersDataSchema,
} from "../src/schemas/data";
import type {
  Bank,
  Card,
  CashbackCategory,
  CashbackOffer,
  Merchant,
  MonthlyOffersData,
} from "../src/types/cashback";

interface ValidationIssue {
  filename: string;
  entityId: string;
  field: string;
  message: string;
}

const rootDir = path.resolve(fileURLToPath(import.meta.url), "../..");
const dataDir = path.join(rootDir, "public/data");
const offersDir = path.join(dataDir, "offers");

const issues: ValidationIssue[] = [];

function addIssue(issue: ValidationIssue) {
  issues.push(issue);
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as unknown;
}

function formatZodIssues(
  filename: string,
  entityId: string,
  zodIssues: z.ZodIssue[]
) {
  for (const issue of zodIssues) {
    addIssue({
      filename,
      entityId,
      field: issue.path.join(".") || "(root)",
      message: issue.message,
    });
  }
}

async function parseDataFile<T>(
  filename: string,
  schema: z.ZodType<T>
): Promise<T | null> {
  const filePath = path.join(dataDir, filename);

  try {
    const json = await readJsonFile(filePath);
    const result = schema.safeParse(json);

    if (!result.success) {
      formatZodIssues(filename, "(file)", result.error.issues);
      return null;
    }

    return result.data;
  } catch (error) {
    addIssue({
      filename,
      entityId: "(file)",
      field: "(root)",
      message: error instanceof Error ? error.message : "Unable to read file",
    });
    return null;
  }
}

async function parseOfferFile(filename: string): Promise<MonthlyOffersData | null> {
  const filePath = path.join(offersDir, filename);

  try {
    const json = await readJsonFile(filePath);
    const result = monthlyOffersDataSchema.safeParse(json);

    if (!result.success) {
      formatZodIssues(`offers/${filename}`, "(file)", result.error.issues);
      return null;
    }

    return result.data;
  } catch (error) {
    addIssue({
      filename: `offers/${filename}`,
      entityId: "(file)",
      field: "(root)",
      message: error instanceof Error ? error.message : "Unable to read file",
    });
    return null;
  }
}

function validateUniqueIds(
  filename: string,
  entities: Array<{ id: string }>
) {
  const seen = new Set<string>();

  for (const entity of entities) {
    if (seen.has(entity.id)) {
      addIssue({
        filename,
        entityId: entity.id,
        field: "id",
        message: `Duplicate ID "${entity.id}"`,
      });
    }

    seen.add(entity.id);
  }
}

function validateReferences({
  banks,
  cards,
  categories,
  merchants,
  offerFiles,
}: {
  banks: Bank[];
  cards: Card[];
  categories: CashbackCategory[];
  merchants: Merchant[];
  offerFiles: Array<{ filename: string; data: MonthlyOffersData }>;
}) {
  const bankIds = new Set(banks.map((bank) => bank.id));
  const cardIds = new Set(cards.map((card) => card.id));
  const categoryIds = new Set(categories.map((category) => category.id));
  const merchantIds = new Set(merchants.map((merchant) => merchant.id));

  for (const card of cards) {
    if (!bankIds.has(card.bankId)) {
      addIssue({
        filename: "cards.json",
        entityId: card.id,
        field: "bankId",
        message: `Missing bank reference "${card.bankId}"`,
      });
    }
  }

  for (const merchant of merchants) {
    for (const categoryId of merchant.categoryIds) {
      if (!categoryIds.has(categoryId)) {
        addIssue({
          filename: "merchants.json",
          entityId: merchant.id,
          field: "categoryIds",
          message: `Missing category reference "${categoryId}"`,
        });
      }
    }
  }

  for (const offerFile of offerFiles) {
    for (const offer of offerFile.data.offers) {
      validateOfferReferences({
        filename: `offers/${offerFile.filename}`,
        offer,
        bankIds,
        cardIds,
        categoryIds,
        merchantIds,
      });
    }
  }
}

function validateOfferReferences({
  filename,
  offer,
  bankIds,
  cardIds,
  categoryIds,
  merchantIds,
}: {
  filename: string;
  offer: CashbackOffer;
  bankIds: Set<string>;
  cardIds: Set<string>;
  categoryIds: Set<string>;
  merchantIds: Set<string>;
}) {
  if (!bankIds.has(offer.bankId)) {
    addIssue({
      filename,
      entityId: offer.id,
      field: "bankId",
      message: `Missing bank reference "${offer.bankId}"`,
    });
  }

  for (const cardId of offer.cardIds) {
    if (!cardIds.has(cardId)) {
      addIssue({
        filename,
        entityId: offer.id,
        field: "cardIds",
        message: `Missing card reference "${cardId}"`,
      });
    }
  }

  for (const categoryId of offer.categoryIds) {
    if (!categoryIds.has(categoryId)) {
      addIssue({
        filename,
        entityId: offer.id,
        field: "categoryIds",
        message: `Missing category reference "${categoryId}"`,
      });
    }
  }

  for (const merchantId of offer.merchantIds) {
    if (!merchantIds.has(merchantId)) {
      addIssue({
        filename,
        entityId: offer.id,
        field: "merchantIds",
        message: `Missing merchant reference "${merchantId}"`,
      });
    }
  }
}

function validateMonthlyOfferFile(filename: string, data: MonthlyOffersData) {
  const expectedPeriod = filename.replace(/\.json$/, "");

  if (data.period !== expectedPeriod) {
    addIssue({
      filename: `offers/${filename}`,
      entityId: "(file)",
      field: "period",
      message: `Period "${data.period}" does not match filename "${expectedPeriod}"`,
    });
  }

  validateUniqueIds(`offers/${filename}`, data.offers);

  for (const offer of data.offers) {
    validateOfferBusinessRules(`offers/${filename}`, data.period, offer);
  }
}

function validateOfferBusinessRules(
  filename: string,
  period: string,
  offer: CashbackOffer
) {
  if (!offer.id.includes(period)) {
    addIssue({
      filename,
      entityId: offer.id,
      field: "id",
      message: `Offer ID must include period "${period}"`,
    });
  }

  if (Date.parse(offer.validFrom) > Date.parse(offer.validTo)) {
    addIssue({
      filename,
      entityId: offer.id,
      field: "validFrom",
      message: "validFrom must not be later than validTo",
    });
  }

  if (offer.reward.type === "percent" && offer.reward.value > 100) {
    addIssue({
      filename,
      entityId: offer.id,
      field: "reward.value",
      message: "Percent reward must not exceed 100",
    });
  }

  if (offer.activation.mode === "automatic") {
    if (offer.activation.requiredBeforePurchase) {
      addIssue({
        filename,
        entityId: offer.id,
        field: "activation.requiredBeforePurchase",
        message: "Automatic activation cannot be required before purchase",
      });
    }

    if (offer.activation.instructions !== null) {
      addIssue({
        filename,
        entityId: offer.id,
        field: "activation.instructions",
        message: "Automatic activation must not include activation instructions",
      });
    }
  }

  if (offer.source.verifiedAt.length === 0) {
    addIssue({
      filename,
      entityId: offer.id,
      field: "source.verifiedAt",
      message: "Verification date is required",
    });
  }
}

async function main() {
  const banks = await parseDataFile("banks.json", banksSchema);
  const cards = await parseDataFile("cards.json", cardsSchema);
  const categories = await parseDataFile("categories.json", categoriesSchema);
  const merchants = await parseDataFile("merchants.json", merchantsSchema);

  if (banks) {
    validateUniqueIds("banks.json", banks);
  }

  if (cards) {
    validateUniqueIds("cards.json", cards);
  }

  if (categories) {
    validateUniqueIds("categories.json", categories);
  }

  if (merchants) {
    validateUniqueIds("merchants.json", merchants);
  }

  const offerFilenames = (await readdir(offersDir))
    .filter((filename) => filename.endsWith(".json") && filename !== "index.json")
    .sort();
  const offerFiles: Array<{ filename: string; data: MonthlyOffersData }> = [];

  for (const filename of offerFilenames) {
    const data = await parseOfferFile(filename);

    if (data) {
      validateMonthlyOfferFile(filename, data);
      offerFiles.push({ filename, data });
    }
  }

  if (banks && cards && categories && merchants) {
    validateReferences({ banks, cards, categories, merchants, offerFiles });
  }

  const offerIndex = await parseOfferIndexFile();

  if (offerIndex) {
    validateOfferIndex(offerFilenames, offerIndex.periods);
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(
        `${issue.filename} | ${issue.entityId} | ${issue.field}: ${issue.message}`
      );
    }

    process.exitCode = 1;
    return;
  }

  console.log(`Data validation passed (${offerFiles.length} monthly file).`);
}

async function parseOfferIndexFile(): Promise<{ periods: string[] } | null> {
  const filePath = path.join(offersDir, "index.json");

  try {
    const json = await readJsonFile(filePath);
    const result = z
      .object({
        periods: z.array(z.string().regex(/^\d{4}-\d{2}$/)),
      })
      .safeParse(json);

    if (!result.success) {
      formatZodIssues("offers/index.json", "(file)", result.error.issues);
      return null;
    }

    return result.data;
  } catch (error) {
    addIssue({
      filename: "offers/index.json",
      entityId: "(file)",
      field: "(root)",
      message: error instanceof Error ? error.message : "Unable to read file",
    });
    return null;
  }
}

function validateOfferIndex(offerFilenames: string[], periods: string[]) {
  const filePeriods = offerFilenames.map((filename) =>
    filename.replace(/\.json$/, "")
  );
  const uniquePeriods = new Set(periods);

  if (uniquePeriods.size !== periods.length) {
    addIssue({
      filename: "offers/index.json",
      entityId: "(file)",
      field: "periods",
      message: "Duplicate period in offer index",
    });
  }

  for (const period of periods) {
    if (!filePeriods.includes(period)) {
      addIssue({
        filename: "offers/index.json",
        entityId: period,
        field: "periods",
        message: `Missing offer file for indexed period "${period}"`,
      });
    }
  }

  for (const period of filePeriods) {
    if (!uniquePeriods.has(period)) {
      addIssue({
        filename: `offers/${period}.json`,
        entityId: "(file)",
        field: "period",
        message: `Offer file is missing from offers/index.json`,
      });
    }
  }
}

await main();
