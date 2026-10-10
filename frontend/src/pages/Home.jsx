import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useShoppingList } from "../context/ShoppingListContext";
import { useToast } from "../context/ToastContext";
import IngredientSelector from "../components/IngredientSelector";
import RecipeCard from "../components/RecipeCard";
import RecipeModal from "../components/RecipeModal";
import FilterBar from "../components/FilterBar";
import SimilarPanel from "../components/SimilarPanel";
import SuggestionBar from "../components/SuggestionBar";
import ResultsSkeleton from "../components/Skeleton";
import useSimilar from "../hooks/useSimilar";
import api, { errorMessage } from "../services/api";
import { titleCase } from "../utils/text";

const PANTRY_KEY = "cookthis_pantry";
const PAGE_SIZE = 12;
const MAX_RESULTS = 48; // the ML service caps topN at 50
const DEFAULT_FILTERS = { diet: "", course: "", maxMissing: "", sort: "match", exclude: "" };

function readPantry() {
  try {
    const saved = JSON.parse(localStorage.getItem(PANTRY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function Home() {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItems } = useShoppingList();
  const toast = useToast();
  const location = useLocation();
  const similar = useSimilar();

  // "Use these again" on the History page passes its ingredients in the router state.
  const incoming = location.state?.ingredients;

  const [selectedIngredients, setSelectedIngredients] = useState(() =>
    Array.isArray(incoming) && incoming.length > 0 ? incoming : readPantry()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [options, setOptions] = useState({ diets: [], courses: [] });

  const [recommendMessage, setRecommendMessage] = useState("");
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [unknownIngredients, setUnknownIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);

  // Remember the pantry between visits.
  useEffect(() => {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(selectedIngredients));
  }, [selectedIngredients]);

  // Diet / course dropdown values come from the dataset itself.
  useEffect(() => {
    let cancelled = false;
    api
      .get("/recipes/meta")
      .then((res) => {
        if (!cancelled) setOptions({ diets: res.data.diets || [], courses: res.data.courses || [] });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleIngredient = (name) => {
    setRecommendMessage("");
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const clearAll = () => {
    setSelectedIngredients([]);
    setRecommendMessage("");
  };

  const runSearch = async (ingredients, activeFilters, nextLimit = PAGE_SIZE) => {
    if (ingredients.length === 0) {
      setRecommendMessage("Please select at least one ingredient.");
      return;
    }

    const isLoadMore = nextLimit > PAGE_SIZE;
    setRecommendMessage("");
    setHasSearched(true);
    similar.close();
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await api.post("/recipes/recommend", {
        ingredients,
        topN: nextLimit,
        diet: activeFilters.diet,
        course: activeFilters.course,
        maxMissing: activeFilters.maxMissing === "" ? null : Number(activeFilters.maxMissing),
        sort: activeFilters.sort,
        exclude: activeFilters.exclude
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      const found = response.data.results || [];
      setResults(found);
      setLimit(nextLimit);
      setTotalMatches(response.data.total_matches ?? found.length);
      setUnknownIngredients(response.data.unknown_ingredients || []);

      if (found.length === 0) {
        setRecommendMessage(
          "No matching dishes — try adding more ingredients or relaxing the filters."
        );
      }
    } catch (err) {
      setRecommendMessage(
        errorMessage(err, "Couldn't reach the recommendation service. Please try again.")
      );
      if (!isLoadMore) {
        setResults([]);
        setTotalMatches(0);
        setUnknownIngredients([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFiltersChange = (next) => {
    setFilters(next);
    // Dropdown changes re-run the search once one exists; typing in "Avoid" waits for the button.
    const textOnlyChange = next.exclude !== filters.exclude;
    if (hasSearched && !textOnlyChange) runSearch(selectedIngredients, next);
  };

  // One click on a suggestion adds the ingredient and refreshes the results.
  const addSuggested = (name) => {
    if (selectedIngredients.includes(name)) return;
    const next = [...selectedIngredients, name];
    setSelectedIngredients(next);
    runSearch(next, filters);
  };

  const addMissingToList = (recipe) => {
    const added = addItems(recipe.missing.map(titleCase));
    if (added > 0) {
      toast.success(`Added ${added} ingredient${added === 1 ? "" : "s"} to your shopping list`);
    } else {
      toast.info("Those ingredients are already on your list");
    }
  };

  const readyCount = results.filter((r) => r.can_cook_now).length;
  const swapCount = results.filter((r) => r.swap_ready).length;
  const canLoadMore = !loading && results.length < totalMatches && limit < MAX_RESULTS;

  return (
    <section>
      <div className="hero-banner">
        <span className="hero-emoji">🍅</span>
        <h1>Welcome back, {user?.name?.split(" ")[0] || "chef"}! 👋</h1>
        <p>
          What&apos;s in your fridge today? Select ingredients you already have and discover what
          you can cook.
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
          <h2>Your ingredients ({selectedIngredients.length}):</h2>
          {selectedIngredients.length > 0 && (
            <button type="button" className="btn-ct-ghost btn-ct-small" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        {selectedIngredients.length === 0 ? (
          <p className="ingredient-empty">No ingredients selected yet.</p>
        ) : (
          <div className="chip-row">
            {selectedIngredients.map((name) => (
              <span className="ingredient-chip" key={name}>
                {name}
                <button
                  type="button"
                  className="ingredient-chip-remove"
                  onClick={() => toggleIngredient(name)}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <FilterBar filters={filters} onChange={handleFiltersChange} options={options} />

      {recommendMessage && (
        <div className="ct-alert ct-alert-error recommend-message">{recommendMessage}</div>
      )}

      <button
        type="button"
        className="btn-ct-primary recommend-btn"
        onClick={() => runSearch(selectedIngredients, filters)}
        disabled={loading}
      >
        {loading ? "Cooking up ideas…" : "🍲 Recommend Recipes"}
      </button>

      {hasSearched && (
        <div className="results-section">
          <h2>Recommended for you</h2>

          {loading && <ResultsSkeleton />}

          {!loading && results.length > 0 && (
            <p className="results-summary">
              {totalMatches} dish{totalMatches === 1 ? "" : "es"} match · {readyCount} ready to cook
              {swapCount > 0 && ` · ${swapCount} with swaps`}
            </p>
          )}

          {!loading && unknownIngredients.length > 0 && (
            <div className="unknown-ingredients-note">
              We didn&apos;t recognize: {unknownIngredients.join(", ")} — still searched with the
              rest.
            </div>
          )}

          {!loading && (
            <SuggestionBar
              results={results}
              selectedIngredients={selectedIngredients}
              onAdd={addSuggested}
            />
          )}

          <SimilarPanel
            dish={similar.dish}
            items={similar.items}
            loading={similar.loading}
            error={similar.error}
            onClose={similar.close}
          />

          {!loading && results.length > 0 && (
            <div className="dish-results-grid">
              {results.map((recipe) => (
                <RecipeCard
                  recipe={recipe}
                  key={recipe.name}
                  isFavorite={isFavorite(recipe.name)}
                  onToggleFavorite={toggleFavorite}
                  onSimilar={similar.open}
                  onOpen={setActiveRecipe}
                  onAddMissing={addMissingToList}
                />
              ))}
            </div>
          )}

          {canLoadMore && (
            <div className="load-more">
              <button
                type="button"
                className="btn-ct-ghost"
                onClick={() => runSearch(selectedIngredients, filters, limit + PAGE_SIZE)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : `Show more dishes (${results.length} of ${totalMatches})`}
              </button>
            </div>
          )}
        </div>
      )}

      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          isFavorite={isFavorite(activeRecipe.name)}
          onClose={() => setActiveRecipe(null)}
          onToggleFavorite={toggleFavorite}
          onAddMissing={addMissingToList}
          onSimilar={similar.open}
        />
      )}
    </section>
  );
}

export default Home;
