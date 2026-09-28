import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from "./Context/LanguageContext";
import { ThemeProvider } from "./Context/ThemeContext";

function start() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

// Demo mode (GitHub Pages build): the API runs inside the browser.
if (import.meta.env.VITE_DEMO_MODE === "true") {
  import("./demo/install.js").then(({ installDemo }) => {
    installDemo();
    start();
  });
} else {
  start();
}
