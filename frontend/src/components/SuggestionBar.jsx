import { useMemo } from "react";
import { INGREDIENTS } from "../data/ingredients";

const byLowerName = new Map(INGREDIENTS.map((i) => [i.name.toLowerCase(), i]));

/**
 * "Add one more ingredient and these dishes get much closer."
 * Counts which missing ingredients appear most among dishes that are only 1-2 items away.
 */
function SuggestionBar({ results, selectedIngredients, onAdd }) {
  const suggestions = useMemo(() => {
    const selected = new Set(selectedIngredients.map((n) => n.toLowerCase()));
    const counts = new Map();

    results.forEach((recipe) => {
      if (recipe.can_cook_now || recipe.missing.length > 2) return;
      recipe.missing.forEach((item) => {
        const match = byLowerName.get(item.toLowerCase());
        if (match && !selected.has(match.name.toLowerCase())) {
          counts.set(match.name, (counts.get(match.name) || 0) + 1);
        }
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, dishes]) => ({ name, dishes, icon: byLowerName.get(name.toLowerCase()).icon }));
  }, [results, selectedIngredients]);

  if (suggestions.length === 0) return null;

  return (
    <div className="suggestion-bar">
      <span className="suggestion-title">💡 Add one more ingredient to get closer:</span>
      <div className="suggestion-chips">
        {suggestions.map((s) => (
          <button type="button" className="suggestion-chip" key={s.name} onClick={() => onAdd(s.name)}>
            <span>{s.icon}</span> + {s.name}
            <small>
              {s.dishes} dish{s.dishes === 1 ? "" : "es"}
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestionBar;
