import { currentMonthPreferencesSchema } from "@/schemas/preferences";
import type {
  CurrentMonthOfferStatus,
  CurrentMonthPreferences,
} from "@/types/preferences";

import { getBrowserStorage, type KeyValueStorage } from "./browserStorage";
import { CURRENT_MONTH_PREFERENCES_STORAGE_KEY } from "./storageKeys";

export function createEmptyCurrentMonthPreferences(
  period: string,
  now = new Date()
): CurrentMonthPreferences {
  return {
    period,
    offerPreferences: [],
    schemaVersion: 1,
    updatedAt: now.toISOString(),
  };
}

export function createCurrentMonthPreferencesRepository(
  storage: KeyValueStorage | null = getBrowserStorage()
) {
  function persist(preferences: CurrentMonthPreferences) {
    if (storage) {
      storage.setItem(
        CURRENT_MONTH_PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences)
      );
    }

    return preferences;
  }

  function readRaw(): CurrentMonthPreferences | null {
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(CURRENT_MONTH_PREFERENCES_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = currentMonthPreferencesSchema.safeParse(JSON.parse(raw));

      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      return null;
    }

    return null;
  }

  function readForPeriod(period: string): CurrentMonthPreferences {
    const preferences = readRaw();

    if (!preferences || preferences.period !== period) {
      return persist(createEmptyCurrentMonthPreferences(period));
    }

    return preferences;
  }

  function resetForPeriod(period: string): CurrentMonthPreferences {
    return persist(createEmptyCurrentMonthPreferences(period));
  }

  function setOfferStatus(
    period: string,
    offerId: string,
    status: CurrentMonthOfferStatus
  ): CurrentMonthPreferences {
    const preferences = readForPeriod(period);
    const updatedAt = new Date().toISOString();
    const existing = preferences.offerPreferences.filter(
      (preference) => preference.offerId !== offerId
    );

    return persist({
      ...preferences,
      offerPreferences: [
        ...existing,
        {
          offerId,
          status,
          updatedAt,
        },
      ],
      updatedAt,
    });
  }

  function clearOfferStatus(
    period: string,
    offerId: string
  ): CurrentMonthPreferences {
    const preferences = readForPeriod(period);
    const nextOfferPreferences = preferences.offerPreferences.filter(
      (preference) => preference.offerId !== offerId
    );

    if (nextOfferPreferences.length === preferences.offerPreferences.length) {
      return preferences;
    }

    return persist({
      ...preferences,
      offerPreferences: nextOfferPreferences,
      updatedAt: new Date().toISOString(),
    });
  }

  function clear(): void {
    storage?.removeItem(CURRENT_MONTH_PREFERENCES_STORAGE_KEY);
  }

  return {
    readForPeriod,
    resetForPeriod,
    setOfferStatus,
    clearOfferStatus,
    clear,
  };
}
