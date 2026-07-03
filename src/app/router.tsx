import { createHashRouter } from "react-router-dom";

import { App } from "@/app/App";
import { SearchPage } from "@/pages/SearchPage/SearchPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
    ],
  },
]);
