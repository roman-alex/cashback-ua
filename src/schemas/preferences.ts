import { z } from "zod";

export const defaultFundingSourceSchema = z.enum(["all", "own", "credit"]);
export const defaultChannelSchema = z.enum(["all", "online", "offline"]);

export const userPreferencesSchema = z.object({
  selectedBankIds: z.array(z.string().min(1)),
  selectedCardIds: z.array(z.string().min(1)),
  defaultFundingSource: defaultFundingSourceSchema,
  defaultChannel: defaultChannelSchema,
  schemaVersion: z.literal(1),
  updatedAt: z.string().datetime({ offset: true }),
});

export const currentMonthOfferStatusSchema = z.enum([
  "activated",
  "not-available",
]);

export const currentMonthOfferPreferenceSchema = z.object({
  offerId: z.string().min(1),
  status: currentMonthOfferStatusSchema,
  updatedAt: z.string().datetime({ offset: true }),
});

export const currentMonthPreferencesSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/),
  offerPreferences: z.array(currentMonthOfferPreferenceSchema),
  schemaVersion: z.literal(1),
  updatedAt: z.string().datetime({ offset: true }),
});
