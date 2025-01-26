import { BrowserRouter } from "react-router-dom";
import "swagger-ui-react/swagger-ui.css";
import { OpenAPIContextProvider } from "./contexts/OpenAPIContext";
import Router from "./routes/Router";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <BrowserRouter>
      <OpenAPIContextProvider>
        <ThemeProvider>
          <CssBaseline />
          <Router />
        </ThemeProvider>
      </OpenAPIContextProvider>
    </BrowserRouter>
  );
}
