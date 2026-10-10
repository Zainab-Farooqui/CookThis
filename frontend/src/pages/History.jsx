import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../services/api";

function formatWhen(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
}

function History() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/history")
      .then((res) => {
        if (!cancelled) setEntries(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your history."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clearHistory = async () => {
    try {
      await api.delete("/history");
      setEntries([]);
    } catch (err) {
      setError(errorMessage(err, "Couldn't clear your history."));
    }
  };

  const runAgain = (entry) => navigate("/home", { state: { ingredients: entry.ingredients } });

  return (
    <section className="library-page">
      <div className="library-header">
        <h1>🕒 Search history</h1>
        <p>Your latest ingredient searches.</p>
        {entries.length > 0 && (
          <button type="button" className="btn-ct-ghost btn-ct-small" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </div>

      {error && <div className="ct-alert ct-alert-error">{error}</div>}
      {loading && <p className="results-loading">Loading…</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="ingredient-empty">No searches yet — pick some ingredients on the Home page.</p>
      )}

      <ul className="library-list">
        {entries.map((entry) => (
          <li className="library-item library-item-column" key={entry.id}>
            <div className="library-item-row">
              <span className="library-item-meta">{formatWhen(entry.createdAt)}</span>
              <span className="library-item-meta">
                {entry.resultCount} result{entry.resultCount === 1 ? "" : "s"}
                {entry.topDish ? ` · top: ${entry.topDish}` : ""}
              </span>
            </div>
            <div className="chip-row">
              {entry.ingredients.map((name) => (
                <span className="dish-result-pill dish-result-pill-have" key={name}>
                  {name}
                </span>
              ))}
            </div>
            <div>
              <button type="button" className="btn-ct-primary btn-ct-small" onClick={() => runAgain(entry)}>
                Use these again
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default History;
