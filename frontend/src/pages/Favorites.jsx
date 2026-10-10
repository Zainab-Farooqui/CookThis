import { useFavorites } from "../context/FavoritesContext";
import SimilarPanel from "../components/SimilarPanel";
import useSimilar from "../hooks/useSimilar";

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const similar = useSimilar();

  return (
    <section className="library-page">
      <div className="library-header">
        <h1>♥ Favorite dishes</h1>
        <p>Dishes you saved from your recommendations.</p>
      </div>

      <SimilarPanel
        dish={similar.dish}
        items={similar.items}
        loading={similar.loading}
        error={similar.error}
        onClose={similar.close}
      />

      {favorites.length === 0 ? (
        <p className="ingredient-empty">
          Nothing saved yet — tap the heart on a recommended dish to keep it here.
        </p>
      ) : (
        <ul className="library-list">
          {favorites.map((fav) => (
            <li className="library-item" key={fav.dishName}>
              <div>
                <h3 className="library-item-title">{fav.dishName}</h3>
                <span className="library-item-meta">Saved {formatDate(fav.createdAt)}</span>
              </div>
              <div className="library-item-actions">
                <button
                  type="button"
                  className="btn-ct-ghost btn-ct-small"
                  onClick={() => similar.open(fav.dishName)}
                >
                  Similar dishes
                </button>
                <button
                  type="button"
                  className="btn-ct-ghost btn-ct-small"
                  onClick={() => toggleFavorite(fav.dishName)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Favorites;
