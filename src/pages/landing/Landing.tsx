import { useOpenAPI } from "../../contexts/OpenAPIContext";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import ApiLink from "../../components/ApiLink";
import TimeAgo from "../../components/TimeAgo";
import { Refresh } from "@mui/icons-material";

export default function Landing() {
  const { openAPIURLs, lastFetched, refetch } = useOpenAPI();

  return (
    <Box
      sx={{
        p: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 600,
            color: "transparent",
            background: "linear-gradient(to right, #666, #ccc)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
          }}
        >
          OpenAPI Documentation
        </Typography>
        <Typography variant="h5" sx={{ mt: 2, color: "#666" }}>
          Select an API to view its documentation:
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ maxWidth: "900px", width: "100%" }}>
        {Array.from(openAPIURLs?.entries() || []).map(([hostname, data]) => (
          <Grid item xs={12} sm={6} md={4} key={hostname}>
            <ApiLink
              hostname={hostname}
              status={data.status || "unknown"}
              rtt={data.rtt}
            />
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
        Last fetched: <TimeAgo timestamp={lastFetched / 1000} />{" "}
        <Tooltip title={"Refetch openapi specs"}>
          <IconButton size="small" onClick={refetch}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Typography>
    </Box>
  );
}
