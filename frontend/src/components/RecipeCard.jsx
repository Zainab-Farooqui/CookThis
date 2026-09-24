function formatMinutes(min) {
  if (min === undefined || min === null) return null;
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60 ? `${min % 60}m` : ""}`.trim() : `${min} min`;
}

function RecipeCard({ recipe }) {
  const { name, score, can_cook_now: canCookNow, have, missing, meta = {} } = recipe;
  const totalTime =
    meta.prep_time !== undefined || meta.cook_time !== undefined
      ? (Number(meta.prep_time) || 0) + (Number(meta.cook_time) || 0)
      : null;

  const tags = [
    meta.diet,
    meta.course,
    meta.flavor_profile,
    meta.state,
    totalTime ? formatMinutes(totalTime) : null,
  ].filter(Boolean);

  return (
    <article className={`recipe-card${canCookNow ? " recipe-card-ready" : ""}`}>
      <header className="recipe-card-header">
        <h3 className="recipe-card-title">{name}</h3>
        <span className="recipe-score" title="How well your ingredients match this dish">
          {Math.round(score)}% match
        </span>
      </header>

      <p className={`recipe-status ${canCookNow ? "recipe-status-ready" : ""}`}>
        {canCookNow
          ? "✅ You have everything you need!"
          : `🛒 Missing ${missing.length} ingredient${missing.length === 1 ? "" : "s"}`}
      </p>

      {tags.length > 0 && (
        <div className="recipe-tags">
          {tags.map((tag) => (
            <span className="recipe-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {have.length > 0 && (
        <div className="recipe-ingredients">
          <span className="recipe-ingredients-label">You have</span>
          {have.map((item) => (
            <span className="recipe-pill recipe-pill-have" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="recipe-ingredients">
          <span className="recipe-ingredients-label">You need</span>
          {missing.map((item) => (
            <span className="recipe-pill recipe-pill-missing" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default RecipeCard;
