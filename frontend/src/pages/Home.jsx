import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import IngredientSelector from "../components/IngredientSelector";
import { INGREDIENTS } from "../data/ingredients";
// import api from "../services/api"; // wire up once POST /api/recipes/recommend exists

function getIngredientByName(name) {
  return INGREDIENTS.find((ingredient) => ingredient.name === name);
}

function Home() {
  const { user } = useAuth();

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recommendMessage, setRecommendMessage] = useState("");

  const toggleIngredient = (name) => {
    setRecommendMessage("");
    setSelectedIngredients((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const clearAll = () => {
    setSelectedIngredients([]);
    setRecommendMessage("");
  };

  const handleRecommend = () => {
    if (selectedIngredients.length === 0) {
      setRecommendMessage("Please select at least one ingredient.");
      return;
    }

    setRecommendMessage("");
    // Future: const { data } = await api.post("/recipes/recommend", { ingredients: selectedIngredients });
    console.log(selectedIngredients);
  };

  return (
    <section>
      <div className="hero-banner">
        <span className="hero-emoji">🍅</span>
        <h1>Welcome back, {user?.name?.split(" ")[0] || "chef"}! 👋</h1>
        <p>
          What&apos;s in your fridge today? Select ingredients you already
          have and discover what you can cook.
        </p>
      </div>

      <IngredientSelector
        selectedIngredients={selectedIngredients}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onToggle={toggleIngredient}
      />

      <div className="selected-ingredients">
        <div className="selected-ingredients-header">
          <h2>Your ingredients:</h2>
          {selectedIngredients.length > 0 && (
            <button
              type="button"
              className="btn-ct-ghost btn-ct-small"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}
        </div>

        {selectedIngredients.length === 0 ? (
          <p className="ingredient-empty">No ingredients selected yet.</p>
        ) : (
          <div className="chip-row">
            {selectedIngredients.map((name) => {
              const ingredient = getIngredientByName(name);
              return (
                <span className="ingredient-chip" key={name}>
                  {ingredient?.icon} {name}
                  <button
                    type="button"
                    className="ingredient-chip-remove"
                    onClick={() => toggleIngredient(name)}
                    aria-label={`Remove ${name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {recommendMessage && (
        <div className="ct-alert ct-alert-error recommend-message">
          {recommendMessage}
        </div>
      )}

      <button
        type="button"
        className="btn-ct-primary recommend-btn"
        onClick={handleRecommend}
      >
        🍲 Recommend Recipes
      </button>
    </section>
  );
}

export default Home;
