import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { useOpenAPI } from "../contexts/OpenAPIContext";
import SwaggerUI from "swagger-ui-react";

import { Layout } from "../layouts/Layout";
import { useMemo } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";

export default function Router() {
  const { openAPIURLs, ui } = useOpenAPI();

  const dynamicRoutes = Array.from(openAPIURLs?.entries() || []).map(
    ([hostname, data]) => ({
      path: `/${hostname}`,
      element: data.initialized ? (
        useMemo(() => {
          switch (ui) {
            case "swagger":
              return (
                <Stack
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(10px)",
                    maxWidth: "1400px",
                    margin: "auto",
                    borderRadius: "2rem",
                  }}
                >
                  <SwaggerUI spec={data.spec} url={data.url} />
                </Stack>
              );
            case "scalar":
              return <Typography variant="h1">Not implemented.</Typography>;
          }
        }, [data, ui])
      ) : (
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "100vh" }}
        >
          <CircularProgress />
        </Stack>
      ),
    })
  );

  const updatedRoutes = [
    ...routes,
    {
      path: "/",
      element: <Layout />,
      children: [...(routes[0].children || []), ...dynamicRoutes],
    },
  ];

  return useRoutes(updatedRoutes);
}
