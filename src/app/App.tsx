import { Outlet } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { PwaUpdatePrompt } from "@/components/PwaUpdatePrompt/PwaUpdatePrompt";

export function App() {
  return (
    <AppShell>
      <Outlet />
      <PwaUpdatePrompt />
    </AppShell>
  );
}
