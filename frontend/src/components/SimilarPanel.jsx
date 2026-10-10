function SimilarPanel({ dish, items, loading, error, onClose }) {
  if (!dish) return null;

  return (
    <aside className="similar-panel" aria-live="polite">
      <div className="similar-panel-header">
        <h3>If you like {dish}, try…</h3>
        <button type="button" className="btn-ct-ghost btn-ct-small" onClick={onClose}>
          Close
        </button>
      </div>

      {loading && <p className="results-loading">Finding similar dishes…</p>}
      {error && <div className="ct-alert ct-alert-error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <p className="ingredient-empty">No similar dishes found.</p>
      )}

      <ul className="similar-list">
        {items.map((item) => (
          <li key={item.name} className="similar-item">
            <div className="similar-item-top">
              <strong>{item.name}</strong>
              <span className="dish-result-score">{Math.round(item.similarity)}% alike</span>
            </div>
            {item.shared.length > 0 && (
              <p className="similar-shared">Shares: {item.shared.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default SimilarPanel;
