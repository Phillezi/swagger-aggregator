import { useNavigate } from "react-router-dom";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";

interface ApiLinkProps {
  hostname: string;
  status: "unknown" | "up" | "down";
  rtt?: number;
}

export default function ApiLink({ hostname, status, rtt }: ApiLinkProps) {
  const navigate = useNavigate();
  // Determine LED color based on status
  const getStatusColor = () => {
    switch (status) {
      case "up":
        return "#28a745"; // Green
      case "down":
        return "#dc3545"; // Red
      case "unknown":
      default:
        return "#6c757d"; // Gray
    }
  };

  return (
    <Paper
      elevation={3}
      sx={
        status === "up"
          ? {
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: 6,
              },
            }
          : {
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              transition: "transform 0.3s, box-shadow 0.3s",
              backgroundColor: "#f0f0f0",
            }
      }
      onClick={() => {
        navigate(`/${hostname}`);
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
          width: "100%",
          borderRadius: 2,
          transition: "color 0.4s",
        }}
      >
        <Stack
          direction="row"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <Tooltip title={status}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`,
                flexShrink: 0,
              }}
            />
          </Tooltip>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.25rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
            }}
          >
            {hostname}
          </Typography>
        </Stack>
        {rtt !== undefined && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            RTT: {rtt !== null ? `${rtt.toFixed(1)} ms` : "N/A"}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
