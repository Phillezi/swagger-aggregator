import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { useOpenAPI } from "../contexts/OpenAPIContext";
import { Brightness4, Brightness7, GitHub, Menu } from "@mui/icons-material";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const API_THRESHOLD = 5;

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openAPIURLs } = useOpenAPI();
  const { toggleTheme, mode } = useTheme();

  const handleNavigate = (hostname: string) => {
    navigate(`/${hostname}`);
    setDrawerOpen(false);
  };
  const useDrawer = openAPIURLs?.size || 0 > API_THRESHOLD;

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        boxShadow: "none",
        "& .MuiPaper-root": {
          boxShadow: "none", // Remove shadow from paper (more specific override)
        },
        zIndex: 1100,
      }}
    >
      <Toolbar>
        <Box
          sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}
          onClick={() => navigate("/")}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {import.meta.env.VITE_LOGO || "OpenAPI spec aggregator"}
          </Typography>
        </Box>

        <IconButton onClick={toggleTheme} sx={{ color: "white" }}>
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>

        <IconButton
          aria-label="menu"
          edge="end"
          sx={
            useDrawer
              ? { display: { xs: "block", md: "block" }, color: "white" }
              : { display: { xs: "block", md: "none" }, color: "white" }
          }
          onClick={() => setDrawerOpen(true)}
        >
          <Menu />
        </IconButton>

        <Box
          sx={
            useDrawer
              ? { display: { xs: "none", md: "none" } }
              : { display: { xs: "none", md: "flex" }, gap: 2 }
          }
        >
          {Array.from(openAPIURLs?.keys() || []).map((hostname) => (
            <Typography
              key={hostname}
              variant="body1"
              sx={{
                cursor: "pointer",
                ":hover": { textDecoration: "underline" },
                fontWeight: "500",
                color: location.pathname.includes(hostname)
                  ? "#007BFF"
                  : "inherit",
              }}
              onClick={() => handleNavigate(hostname)}
            >
              {hostname}
            </Typography>
          ))}
        </Box>
      </Toolbar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {Array.from(openAPIURLs?.keys() || []).map((hostname) => (
              <MenuItem key={hostname} onClick={() => handleNavigate(hostname)}>
                <ListItemText primary={hostname} />
              </MenuItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: "black",
      color: "white",
      padding: "1rem 0",
      textAlign: "center",
      width: "100%",
      boxShadow: 3,
      marginTop: "auto",
    }}
  >
    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
      &copy; {new Date().getFullYear()} OpenAPI spec aggregator | All rights
      reserved.
    </Typography>
    <Box
      sx={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}
    >
      <IconButton
        color="inherit"
        href="https://github.com/Phillezi/swagger-aggregator"
        target="_blank"
        aria-label="GitHub"
      >
        <GitHub />
      </IconButton>
    </Box>
  </Box>
);
export function Layout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "background.default",
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.9))",
      }}
    >
      <CssBaseline />
      <Header />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: 1,
          borderRadius: 2,
          maxWidth: "100vw",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
