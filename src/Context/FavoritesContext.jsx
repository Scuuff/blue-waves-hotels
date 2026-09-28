import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

const FAVORITES_URL = "http://localhost:5050/favorites";
const FAVORITES_CACHE_KEY = "blueWaveFavoritesCache";

function getFavoritesStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  if (sessionStorage.getItem("token") && !localStorage.getItem("token")) {
    return sessionStorage;
  }

  return localStorage;
}

function getCachedFavorites() {
  try {
    const storage = getFavoritesStorage();
    const rawValue = storage?.getItem(FAVORITES_CACHE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const { token, isAuthenticated, isAuthLoading } = useAuth();
  const [favorites, setFavorites] = useState(getCachedFavorites);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);

  useEffect(() => {
    const storage = getFavoritesStorage();

    if (!storage) {
      return;
    }

    storage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const loadFavorites = async (authToken = token) => {
    if (!authToken) {
      setFavorites([]);
      setIsFavoritesLoading(false);
      return [];
    }

    try {
      setIsFavoritesLoading(true);

      const response = await fetch(FAVORITES_URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch favorites");
      }

      const nextFavorites = data.favorites || [];
      setFavorites(nextFavorites);
      return nextFavorites;
    } catch (error) {
      console.error("Favorites load error:", error.message);
      return [];
    } finally {
      setIsFavoritesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!token || !isAuthenticated) {
      setFavorites([]);
      setIsFavoritesLoading(false);
      return;
    }

    const cachedFavorites = getCachedFavorites();
    if (cachedFavorites.length > 0) {
      setFavorites(cachedFavorites);
      setIsFavoritesLoading(false);
    }

    loadFavorites(token);
  }, [token, isAuthenticated, isAuthLoading]);

  const toggleFavorite = async (room) => {
    if (!token || !isAuthenticated) {
      throw new Error("Please login first to add favorites.");
    }

    const response = await fetch(`${FAVORITES_URL}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotelId: room.hotelId || null,
        roomId: room._id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update favorite");
    }

    const favoriteRoom = {
      ...room,
      roomId: room.roomId || room._id,
    };

    setFavorites((currentFavorites) => {
      if (data.action === "added") {
        const exists = currentFavorites.some(
          (favorite) => favorite._id === room._id || favorite.roomId === room._id
        );
        return exists ? currentFavorites : [...currentFavorites, favoriteRoom];
      }

      return currentFavorites.filter(
        (favorite) => favorite._id !== room._id && favorite.roomId !== room._id
      );
    });

    return data.action;
  };

  const isFavorite = (roomId) =>
    favorites.some(
      (favorite) => favorite._id === roomId || favorite.roomId === roomId
    );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavoritesLoading,
        loadFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
