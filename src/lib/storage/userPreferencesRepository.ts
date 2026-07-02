import { userPreferencesSchema } from "@/schemas/preferences";
import type { UserPreferences, UserPreferencesPatch } from "@/types/preferences";

import { getBrowserStorage, type KeyValueStorage } from "./browserStorage";
import { USER_PREFERENCES_STORAGE_KEY } from "./storageKeys";

export function createDefaultUserPreferences(
  now = new Date()
): UserPreferences {
  return {
    selectedBankIds: [],
    selectedCardIds: [],
    defaultFundingSource: "all",
    defaultChannel: "all",
    schemaVersion: 1,
    updatedAt: now.toISOString(),
  };
}

export function createUserPreferencesRepository(
  storage: KeyValueStorage | null = getBrowserStorage()
) {
  function read(): UserPreferences {
    if (!storage) {
      return createDefaultUserPreferences();
    }

    const raw = storage.getItem(USER_PREFERENCES_STORAGE_KEY);

    if (!raw) {
      return createDefaultUserPreferences();
    }

    try {
      const parsed = userPreferencesSchema.safeParse(JSON.parse(raw));

      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      return createDefaultUserPreferences();
    }

    return createDefaultUserPreferences();
  }

  function save(preferences: UserPreferences): UserPreferences {
    if (storage) {
      storage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    }

    return preferences;
  }

  function update(patch: UserPreferencesPatch): UserPreferences {
    return save({
      ...read(),
      ...patch,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
    });
  }

  function clear(): void {
    storage?.removeItem(USER_PREFERENCES_STORAGE_KEY);
  }

  return {
    read,
    save,
    update,
    clear,
  };
}
