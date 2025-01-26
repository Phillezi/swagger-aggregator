import { Navigate, RouteObject } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import { Layout } from "../layouts/Layout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
];
