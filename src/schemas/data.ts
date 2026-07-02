import { z } from "zod";

const idSchema = z.string().min(1).regex(/^[a-z0-9-]+$/);
const isoDateSchema = z.string().date();
const isoDateTimeSchema = z.string().datetime({ offset: true });
const mccSchema = z.string().regex(/^\d{4}$/);

export const bankSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  slug: idSchema,
  logo: z.string().min(1),
  active: z.boolean(),
});

export const paymentSystemSchema = z.enum(["visa", "mastercard"]);

export const cardSchema = z.object({
  id: idSchema,
  bankId: idSchema,
  name: z.string().min(1),
  paymentSystems: z.array(paymentSystemSchema).min(1),
  supportsOwnFunds: z.boolean(),
  supportsCreditFunds: z.boolean(),
  active: z.boolean(),
});

export const cashbackCategorySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  mccCodes: z.array(mccSchema),
});

export const merchantSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  categoryIds: z.array(idSchema).min(1),
  mccCodes: z.array(mccSchema),
  active: z.boolean(),
});

export const offerTypeSchema = z.enum([
  "category",
  "partner",
  "base",
  "personal",
  "welcome",
  "special",
]);

export const fundingSourceSchema = z.enum(["own", "credit"]);
export const paymentChannelSchema = z.enum(["online", "offline"]);

export const activationModeSchema = z.enum([
  "automatic",
  "manual",
  "category-selection",
  "personal-confirmation",
  "registration",
]);

export const cashbackOfferSchema = z.object({
  id: idSchema,
  offerKey: idSchema.optional(),
  bankId: idSchema,
  cardIds: z.array(idSchema).min(1),
  type: offerTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  categoryIds: z.array(idSchema),
  merchantIds: z.array(idSchema),
  mccCodes: z.array(mccSchema),
  reward: z.object({
    type: z.enum(["percent", "fixed"]),
    value: z.number().positive(),
    maxAmount: z.number().positive().nullable(),
    currency: z.literal("UAH"),
  }),
  fundingSources: z.array(fundingSourceSchema).min(1),
  channels: z.array(paymentChannelSchema).min(1),
  activation: z.object({
    mode: activationModeSchema,
    requiredBeforePurchase: z.boolean(),
    instructions: z.string().min(1).nullable(),
    actionUrl: z.string().url().nullable(),
  }),
  conditions: z.object({
    minPurchaseAmount: z.number().positive().nullable(),
    firstPurchaseOnly: z.boolean(),
    newCustomerOnly: z.boolean(),
    paymentSystems: z.array(paymentSystemSchema),
    notes: z.array(z.string().min(1)),
  }),
  validFrom: isoDateSchema,
  validTo: isoDateSchema,
  source: z.object({
    type: z.enum(["official", "editorial", "manual", "community"]),
    url: z.string().url().nullable(),
    verifiedAt: isoDateSchema,
  }),
  status: z.enum(["draft", "active", "disabled"]),
});

export const monthlyOffersDataSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/),
  updatedAt: isoDateTimeSchema,
  offers: z.array(cashbackOfferSchema),
});

export const banksSchema = z.array(bankSchema);
export const cardsSchema = z.array(cardSchema);
export const categoriesSchema = z.array(cashbackCategorySchema);
export const merchantsSchema = z.array(merchantSchema);
