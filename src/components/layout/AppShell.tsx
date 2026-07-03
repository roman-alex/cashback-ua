import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-10 pt-3 md:px-6 md:pt-6">
        {children}
      </main>
    </div>
  );
}
