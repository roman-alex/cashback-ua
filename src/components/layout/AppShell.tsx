import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex flex-col" aria-label="Cashback UA">
            <span className="text-lg font-semibold">Cashback UA</span>
            <span className="text-sm text-muted-foreground">
              Кешбеки українських банків
            </span>
          </NavLink>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-4 pb-10 pt-5 md:px-6 md:pt-8">
        {children}
      </main>
    </div>
  );
}
