import { createContext, useContext, useEffect, useState } from "react";

const ShoppingListContext = createContext(null);

const storageKey = (owner) => `cookthis_shopping_${owner || "guest"}`;

function readList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/**
 * Per-user shopping list kept in localStorage.
 * Mount it with key={owner} so switching accounts loads that account's list.
 */
export function ShoppingListProvider({ owner, children }) {
  const key = storageKey(owner);
  const [items, setItems] = useState(() => readList(key));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [key, items]);

  /** Adds names that aren't already listed. Returns how many were new. */
  const addItems = (names) => {
    const seen = new Set(items.map((i) => i.name.toLowerCase()));
    const fresh = [];
    names.forEach((name) => {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        fresh.push({ name, done: false });
      }
    });
    if (fresh.length > 0) setItems([...items, ...fresh]);
    return fresh.length;
  };

  const toggleItem = (name) =>
    setItems((prev) => prev.map((i) => (i.name === name ? { ...i, done: !i.done } : i)));

  const removeItem = (name) => setItems((prev) => prev.filter((i) => i.name !== name));
  const clearDone = () => setItems((prev) => prev.filter((i) => !i.done));
  const clearAll = () => setItems([]);

  const remaining = items.filter((i) => !i.done).length;

  return (
    <ShoppingListContext.Provider
      value={{ items, remaining, addItems, toggleItem, removeItem, clearDone, clearAll }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) {
    throw new Error("useShoppingList must be used within a ShoppingListProvider");
  }
  return ctx;
}
