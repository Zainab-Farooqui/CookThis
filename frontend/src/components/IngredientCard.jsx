function IngredientCard({ ingredient, isSelected, onToggle }) {
  return (
    <button
      type="button"
      className={`ingredient-card${isSelected ? " ingredient-card-selected" : ""}`}
      onClick={() => onToggle(ingredient.name)}
      aria-pressed={isSelected}
    >
      <span className="ingredient-card-icon">{ingredient.icon}</span>
      <span className="ingredient-card-name">{ingredient.name}</span>
    </button>
  );
}

export default IngredientCard;
