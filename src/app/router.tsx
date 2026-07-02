import { createHashRouter } from "react-router-dom";

import { App } from "@/app/App";
import { ArchivePage } from "@/pages/ArchivePage/ArchivePage";
import { SearchPage } from "@/pages/SearchPage/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "archive",
        element: <ArchivePage />,
      },
    ],
  },
]);
