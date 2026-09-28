import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext();

function getStoredUser() {
  try {
    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");

    const storedUser = localUser || sessionUser;

    if (!storedUser || storedUser === "undefined" || storedUser === "null") {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error parsing stored user:", error);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = () => {
      setCurrentUser(getStoredUser());
      setToken(getStoredToken());
    };

    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setIsAuthLoading(false);
        return;
      }

      try {
        const result = await authApi.me();
        const nextUser = result?.user ?? null;
        if (nextUser) {
          const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
          storage.setItem("user", JSON.stringify(nextUser));
        }
        if (isMounted) {
          setCurrentUser(nextUser);
          setToken(storedToken);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setCurrentUser(null);
    setToken(null);
  };

  const refreshAuth = () => {
    setCurrentUser(getStoredUser());
    setToken(getStoredToken());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        logout,
        refreshAuth,
        isAuthLoading,
        isAuthenticated: !!token && !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
