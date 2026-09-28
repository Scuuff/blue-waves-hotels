import { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations from "../data/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const t = useCallback(
    (key) => {
      return translations[language]?.[key] || translations["en"]?.[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
