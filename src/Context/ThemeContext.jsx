import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Dark is the site's native look, so it's the default until the guest
    // explicitly switches to light.
    const saved = localStorage.getItem("darkMode");
    return saved !== "false";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
