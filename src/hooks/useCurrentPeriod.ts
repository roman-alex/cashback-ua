import { useEffect, useState } from "react";

import { getCurrentPeriodKey } from "@/lib/dates/period";

export function useCurrentPeriod() {
  const [period, setPeriod] = useState(getCurrentPeriodKey);

  useEffect(() => {
    function checkPeriod() {
      setPeriod((previousPeriod) => {
        const nextPeriod = getCurrentPeriodKey();

        return previousPeriod === nextPeriod ? previousPeriod : nextPeriod;
      });
    }

    checkPeriod();
    window.addEventListener("focus", checkPeriod);
    document.addEventListener("visibilitychange", checkPeriod);

    return () => {
      window.removeEventListener("focus", checkPeriod);
      document.removeEventListener("visibilitychange", checkPeriod);
    };
  }, []);

  return period;
}
