import { useState } from "react";
import api, { errorMessage } from "../services/api";

/** Loads "dishes similar to X" from the backend and tracks which panel is open. */
export default function useSimilar() {
  const [dish, setDish] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = async (name) => {
    setDish(name);
    setItems([]);
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/recipes/similar", { params: { name, topN: 6 } });
      setItems(res.data.similar || []);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load similar dishes."));
    } finally {
      setLoading(false);
    }
  };

  const close = () => setDish(null);

  return { dish, items, loading, error, open, close };
}
