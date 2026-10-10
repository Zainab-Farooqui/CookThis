import { useEffect, useRef } from "react";
import { titleCase } from "../utils/text";

function formatMinutes(min) {
  if (min === undefined || min === null) return null;
  if (min < 60) return `${min} min`;
  const rest = min % 60;
  return `${Math.floor(min / 60)}h${rest ? ` ${rest}m` : ""}`;
}

function RecipeModal({ recipe, isFavorite, onClose, onToggleFavorite, onAddMissing, onSimilar }) {
  const closeRef = useRef(null);

  // Close on Escape, lock page scroll, move focus into the dialog and restore it afterwards.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const { name, score, coverage, ingredients, have, missing, substitutions = [], meta = {} } = recipe;
  const haveSet = new Set(have);
  const swapFor = (item) => substitutions.find((s) => s.missing === item);

  const facts = [
    meta.diet && ["Diet", titleCase(meta.diet)],
    meta.course && ["Course", titleCase(meta.course)],
    meta.flavor_profile && ["Flavor", titleCase(meta.flavor_profile)],
    meta.state && ["Origin", meta.region ? `${meta.state} (${meta.region})` : meta.state],
    meta.prep_time !== undefined && ["Prep", formatMinutes(Number(meta.prep_time))],
    meta.cook_time !== undefined && ["Cook", formatMinutes(Number(meta.cook_time))],
  ].filter(Boolean);

  return (
    <div className="ct-modal-backdrop" onClick={onClose}>
      <div
        className="ct-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ct-modal-header">
          <div>
            <h2 id="recipe-modal-title">{name}</h2>
            <p className="ct-modal-sub">
              {Math.round(score)}% match · you have {Math.round(coverage ?? 0)}% of the ingredients
            </p>
          </div>
          <button
            type="button"
            ref={closeRef}
            className="ct-modal-close"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </header>

        {facts.length > 0 && (
          <dl className="ct-modal-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <h3 className="ct-modal-section-title">Ingredients ({ingredients.length})</h3>
        <ul className="ct-modal-ingredients">
          {ingredients.map((item) => {
            const owned = haveSet.has(item);
            const swap = !owned && swapFor(item);
            return (
              <li key={item} className={owned ? "ct-modal-ing-have" : "ct-modal-ing-missing"}>
                <span aria-hidden="true">{owned ? "✅" : "🛒"}</span> {titleCase(item)}
                {swap && <em className="swap-hint"> → or use {swap.use}</em>}
              </li>
            );
          })}
        </ul>

        <footer className="ct-modal-actions">
          <button
            type="button"
            className="btn-ct-ghost btn-ct-small"
            onClick={() => onToggleFavorite(name)}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "♥ Saved" : "♡ Save"}
          </button>
          {missing.length > 0 && (
            <button type="button" className="btn-ct-primary btn-ct-small" onClick={() => onAddMissing(recipe)}>
              🛒 Add {missing.length} missing to list
            </button>
          )}
          <button
            type="button"
            className="btn-ct-ghost btn-ct-small"
            onClick={() => {
              onClose();
              onSimilar(name);
            }}
          >
            Similar dishes
          </button>
        </footer>
      </div>
    </div>
  );
}

export default RecipeModal;
