import type { PropsWithChildren } from "react";
import { Archive, Search, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Пошук", icon: Search, end: true },
  { to: "/settings", label: "Налаштування", icon: Settings },
  { to: "/archive", label: "Архів", icon: Archive },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hidden border-b border-border bg-card/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex flex-col" aria-label="Cashback UA">
            <span className="text-lg font-semibold">Cashback UA</span>
            <span className="text-sm text-muted-foreground">
              Кешбеки українських банків
            </span>
          </NavLink>
          <nav className="flex items-center gap-1" aria-label="Основна навігація">
            {navigationItems.map((item) => (
              <DesktopNavLink key={item.to} item={item} />
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-5 md:min-h-[calc(100vh-73px)] md:px-6 md:pb-10 md:pt-8">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-lg backdrop-blur md:hidden"
        aria-label="Нижня навігація"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {navigationItems.map((item) => (
            <MobileNavLink key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

type NavigationItem = (typeof navigationItems)[number];

function DesktopNavLink({ item }: { item: NavigationItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

function MobileNavLink({ item }: { item: NavigationItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}
