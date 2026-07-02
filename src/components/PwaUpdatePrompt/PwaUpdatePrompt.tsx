import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "@/components/ui/button";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md rounded-md border border-border bg-card p-4 text-card-foreground shadow-xl md:bottom-6">
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Дані про кешбеки оновлено</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => updateServiceWorker(true)} type="button">
              Оновити
            </Button>
            <Button
              onClick={() => setNeedRefresh(false)}
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Пізніше
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
