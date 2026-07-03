import { useEffect, useState } from "react";

import {
  getCurrentMonthOffers,
  type CurrentMonthOffersResult,
} from "@/lib/monthly-offers/monthlyOffersRepository";
import {
  loadStaticCashbackData,
  type StaticCashbackData,
} from "@/lib/static-data/staticDataRepository";

export type CashbackDataState =
  | { status: "loading"; staticData: null; currentMonthOffers: null; error: null }
  | {
      status: "available";
      staticData: StaticCashbackData;
      currentMonthOffers: Extract<
        CurrentMonthOffersResult,
        { status: "available" }
      >;
      error: null;
    }
  | {
      status: "missing";
      staticData: StaticCashbackData;
      currentMonthOffers: Extract<
        CurrentMonthOffersResult,
        { status: "missing" }
      >;
      error: null;
    }
  | { status: "error"; staticData: null; currentMonthOffers: null; error: Error };

export function useCashbackData(period: string): CashbackDataState {
  const [state, setState] = useState<CashbackDataState>({
    status: "loading",
    staticData: null,
    currentMonthOffers: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      status: "loading",
      staticData: null,
      currentMonthOffers: null,
      error: null,
    });

    Promise.all([loadStaticCashbackData(), getCurrentMonthOffers(period)])
      .then(([staticData, currentMonthOffers]) => {
        if (!isMounted) {
          return;
        }

        if (currentMonthOffers.status === "available") {
          setState({
            status: "available",
            staticData,
            currentMonthOffers,
            error: null,
          });
          return;
        }

        setState({
          status: "missing",
          staticData,
          currentMonthOffers,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: "error",
          staticData: null,
          currentMonthOffers: null,
          error: error instanceof Error ? error : new Error("Data load failed"),
        });
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  return state;
}
