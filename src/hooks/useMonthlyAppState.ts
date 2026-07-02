import { useCallback, useEffect, useMemo, useState } from "react";

import { getCurrentMonthOffers } from "@/lib/monthly-offers/monthlyOffersRepository";
import {
  createCurrentMonthPreferencesRepository,
  createEmptyCurrentMonthPreferences,
} from "@/lib/storage/currentMonthPreferencesRepository";
import { createUserPreferencesRepository } from "@/lib/storage/userPreferencesRepository";
import type {
  CurrentMonthPreferences,
  CurrentMonthOfferStatus,
  UserPreferences,
  UserPreferencesPatch,
} from "@/types/preferences";

import { useCurrentPeriod } from "./useCurrentPeriod";

export function useMonthlyAppState() {
  const period = useCurrentPeriod();
  const userPreferencesRepository = useMemo(
    () => createUserPreferencesRepository(),
    []
  );
  const currentMonthPreferencesRepository = useMemo(
    () => createCurrentMonthPreferencesRepository(),
    []
  );
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() =>
    userPreferencesRepository.read()
  );
  const [currentMonthPreferences, setCurrentMonthPreferences] =
    useState<CurrentMonthPreferences>(() =>
      createEmptyCurrentMonthPreferences(period)
    );

  useEffect(() => {
    setUserPreferences(userPreferencesRepository.read());
    setCurrentMonthPreferences(
      currentMonthPreferencesRepository.readForPeriod(period)
    );
  }, [currentMonthPreferencesRepository, period, userPreferencesRepository]);

  const updateUserPreferences = useCallback(
    (patch: UserPreferencesPatch) => {
      setUserPreferences(userPreferencesRepository.update(patch));
    },
    [userPreferencesRepository]
  );

  const setOfferStatus = useCallback(
    (offerId: string, status: CurrentMonthOfferStatus) => {
      setCurrentMonthPreferences(
        currentMonthPreferencesRepository.setOfferStatus(period, offerId, status)
      );
    },
    [currentMonthPreferencesRepository, period]
  );

  const clearOfferStatus = useCallback(
    (offerId: string) => {
      setCurrentMonthPreferences(
        currentMonthPreferencesRepository.clearOfferStatus(period, offerId)
      );
    },
    [currentMonthPreferencesRepository, period]
  );

  return {
    period,
    currentMonthOffers: getCurrentMonthOffers(period),
    userPreferences,
    currentMonthPreferences,
    updateUserPreferences,
    setOfferStatus,
    clearOfferStatus,
  };
}
