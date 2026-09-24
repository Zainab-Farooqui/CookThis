import { CATEGORIES, INGREDIENTS } from "../data/ingredients";
import IngredientCard from "./IngredientCard";

function IngredientSelector({
  selectedIngredients,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onToggle,
}) {
  const filteredIngredients = INGREDIENTS.filter((ingredient) => {
    const matchesCategory =
      selectedCategory === "All" || ingredient.category === selectedCategory;
    const matchesSearch = ingredient.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="ingredient-selector">
      <div className="ingredient-search">
        <span className="ingredient-search-icon">🔍</span>
        <input
          type="text"
          className="form-control"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ingredient-category-pills">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill${
              selectedCategory === category ? " category-pill-active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredIngredients.length === 0 ? (
        <p className="ingredient-empty">No ingredients match your search.</p>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-2 ingredient-grid">
          {filteredIngredients.map((ingredient) => (
            <div className="col" key={ingredient.id}>
              <IngredientCard
                ingredient={ingredient}
                isSelected={selectedIngredients.includes(ingredient.name)}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IngredientSelector;