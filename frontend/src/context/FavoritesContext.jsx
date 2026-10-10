import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const token = user?.token;
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    api
      .get("/favorites")
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const favorites = useMemo(() => (token ? items : []), [token, items]);
  const names = useMemo(() => new Set(favorites.map((f) => f.dishName)), [favorites]);

  const isFavorite = (dishName) => names.has(dishName);

  // Optimistic update: the heart flips immediately and rolls back if the server refuses.
  const toggleFavorite = async (dishName) => {
    const wasFavorite = names.has(dishName);
    const snapshot = items;

    setItems((prev) =>
      wasFavorite
        ? prev.filter((f) => f.dishName !== dishName)
        : [{ dishName, createdAt: new Date().toISOString() }, ...prev]
    );

    try {
      if (wasFavorite) {
        await api.delete("/favorites", { params: { dishName } });
      } else {
        await api.post("/favorites", { dishName });
        toast.success(`Saved ${dishName} to favorites`);
      }
    } catch {
      setItems(snapshot);
      toast.error("Couldn't update favorites. Please try again.");
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
