function formatMinutes(min) {
  if (min === undefined || min === null) return null;
  if (min < 60) return `${min} min`;
  const rest = min % 60;
  return `${Math.floor(min / 60)}h${rest ? ` ${rest}m` : ""}`;
}

function RecipeCard({ recipe, isFavorite, onToggleFavorite, onSimilar, onOpen, onAddMissing }) {
  const {
    name,
    score,
    coverage,
    can_cook_now: canCookNow,
    swap_ready: swapReady,
    have,
    missing,
    substitutions = [],
    total_time: totalTime,
    meta = {},
  } = recipe;

  const tags = [
    meta.diet,
    meta.course,
    meta.flavor_profile,
    meta.region ? `${meta.region} India` : null,
    totalTime ? formatMinutes(totalTime) : null,
  ].filter(Boolean);

  const swapFor = (item) => substitutions.find((s) => s.missing === item);

  let statusText;
  if (canCookNow) statusText = "✅ You have everything you need!";
  else if (swapReady) statusText = "🔄 You can make this with swaps";
  else statusText = `🛒 Missing ${missing.length} ingredient${missing.length === 1 ? "" : "s"}`;

  return (
    <article
      className={`dish-result-card${canCookNow ? " dish-result-card-ready" : ""}${
        swapReady ? " dish-result-card-swap" : ""
      }`}
    >
      <header className="dish-result-header">
        <h3 className="dish-result-title">
          <button type="button" className="dish-title-btn" onClick={() => onOpen(recipe)}>
            {name}
          </button>
        </h3>
        <div className="dish-result-actions">
          <span className="dish-result-score" title="How well your ingredients match this dish">
            {Math.round(score)}% match
          </span>
          <button
            type="button"
            className={`fav-btn${isFavorite ? " fav-btn-on" : ""}`}
            onClick={() => onToggleFavorite(name)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>
      </header>

      <div
        className="coverage-bar"
        role="progressbar"
        aria-valuenow={Math.round(coverage ?? 0)}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`You cover ${Math.round(coverage ?? 0)}% of this dish's ingredients`}
      >
        <div className="coverage-bar-fill" style={{ width: `${Math.min(coverage ?? 0, 100)}%` }} />
      </div>

      <p
        className={`dish-result-status${canCookNow ? " dish-result-status-ready" : ""}${
          swapReady ? " dish-result-status-swap" : ""
        }`}
      >
        {statusText}
      </p>

      {tags.length > 0 && (
        <div className="dish-result-tags">
          {tags.map((tag) => (
            <span className="dish-result-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {have.length > 0 && (
        <div className="dish-result-ingredients">
          <span className="dish-result-ingredients-label">You have</span>
          {have.map((item) => (
            <span className="dish-result-pill dish-result-pill-have" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="dish-result-ingredients">
          <span className="dish-result-ingredients-label">You need</span>
          {missing.map((item) => {
            const swap = swapFor(item);
            return (
              <span className="dish-result-pill dish-result-pill-missing" key={item}>
                {item}
                {swap && <em className="swap-hint"> → use {swap.use}</em>}
              </span>
            );
          })}
        </div>
      )}

      <footer className="dish-result-footer">
        <button type="button" className="btn-ct-ghost btn-ct-small" onClick={() => onOpen(recipe)}>
          Details
        </button>
        {missing.length > 0 && (
          <button
            type="button"
            className="btn-ct-ghost btn-ct-small"
            onClick={() => onAddMissing(recipe)}
            title="Add the missing ingredients to your shopping list"
          >
            🛒 Add missing
          </button>
        )}
        <button type="button" className="btn-ct-ghost btn-ct-small" onClick={() => onSimilar(name)}>
          Similar
        </button>
      </footer>
    </article>
  );
}

export default RecipeCard;
