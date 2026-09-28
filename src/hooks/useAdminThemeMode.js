import { useCallback, useEffect, useState } from "react";
import { userPreferencesApi } from "../services/userPreferencesApi";
import { buildScopedStorageKey, getCurrentAdminIdentity } from "../utils/currentAdminIdentity";

const STORAGE_KEY = "darkMode";
const EVENT_NAME = "admin-theme-change";

function readStoredTheme(userId) {
  try {
    const saved = localStorage.getItem(buildScopedStorageKey(STORAGE_KEY, userId));
    return saved === "true";
  } catch {
    return false;
  }
}

export default function useAdminThemeMode() {
  const { userId } = getCurrentAdminIdentity();
  const [darkMode, setDarkModeState] = useState(() => readStoredTheme(userId));
  const [isHydrated, setIsHydrated] = useState(false);

  const setDarkMode = useCallback((next) => {
    setDarkModeState(next);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [setDarkMode, darkMode]);

  useEffect(() => {
    let isMounted = true;
    const localValue = readStoredTheme(userId);
    setDarkModeState(localValue);

    const hydrate = async () => {
      try {
        const result = await userPreferencesApi.getScope("appearance", userId);
        const backendValue = result?.value?.value;
        if (typeof backendValue?.darkMode === "boolean" && isMounted) {
          setDarkModeState(backendValue.darkMode);
        }
      } catch {
        // ignore backend failures, local settings still apply
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };
    hydrate();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(buildScopedStorageKey(STORAGE_KEY, userId), String(darkMode));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { darkMode } }));
    } catch {
      // no-op when storage is not available
    }
    userPreferencesApi.saveScope("appearance", userId, { darkMode }).catch(() => {});
  }, [darkMode, isHydrated, userId]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === buildScopedStorageKey(STORAGE_KEY, userId)) {
        setDarkModeState(event.newValue === "true");
      }
    };

    const handleThemeEvent = (event) => {
      if (typeof event?.detail?.darkMode === "boolean") {
        setDarkModeState(event.detail.darkMode);
      } else {
        setDarkModeState(readStoredTheme(userId));
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_NAME, handleThemeEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_NAME, handleThemeEvent);
    };
  }, [userId]);

  return { darkMode, setDarkMode, toggleDarkMode };
}
