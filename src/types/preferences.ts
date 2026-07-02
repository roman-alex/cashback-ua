export type DefaultFundingSource = "all" | "own" | "credit";
export type DefaultChannel = "all" | "online" | "offline";

export interface UserPreferences {
  selectedBankIds: string[];
  selectedCardIds: string[];
  defaultFundingSource: DefaultFundingSource;
  defaultChannel: DefaultChannel;
  schemaVersion: number;
  updatedAt: string;
}

export type UserPreferencesPatch = Partial<
  Pick<
    UserPreferences,
    | "selectedBankIds"
    | "selectedCardIds"
    | "defaultFundingSource"
    | "defaultChannel"
  >
>;

export type CurrentMonthOfferStatus = "activated" | "not-available";

export interface CurrentMonthOfferPreference {
  offerId: string;
  status: CurrentMonthOfferStatus;
  updatedAt: string;
}

export interface CurrentMonthPreferences {
  period: string;
  offerPreferences: CurrentMonthOfferPreference[];
  schemaVersion: number;
  updatedAt: string;
}
