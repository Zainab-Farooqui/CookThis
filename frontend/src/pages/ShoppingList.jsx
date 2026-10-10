import { Link } from "react-router-dom";
import { useShoppingList } from "../context/ShoppingListContext";
import { useToast } from "../context/ToastContext";
import { titleCase } from "../utils/text";

function ShoppingList() {
  const { items, remaining, toggleItem, removeItem, clearDone, clearAll } = useShoppingList();
  const toast = useToast();

  const copyList = async () => {
    const text = items
      .filter((i) => !i.done)
      .map((i) => `• ${titleCase(i.name)}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Shopping list copied to clipboard");
    } catch {
      toast.error("Couldn't copy the list on this browser.");
    }
  };

  const doneCount = items.length - remaining;

  return (
    <section className="library-page">
      <div className="library-header">
        <h1>🛒 Shopping list</h1>
        <p>
          {items.length === 0
            ? "Ingredients you still need for the dishes you like."
            : `${doneCount} of ${items.length} picked up`}
        </p>

        {items.length > 0 && (
          <div className="library-item-actions">
            <button type="button" className="btn-ct-primary btn-ct-small" onClick={copyList} disabled={remaining === 0}>
              Copy list
            </button>
            <button type="button" className="btn-ct-ghost btn-ct-small" onClick={clearDone} disabled={doneCount === 0}>
              Clear checked
            </button>
            <button type="button" className="btn-ct-ghost btn-ct-small" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="ingredient-empty">
          Your list is empty. Use “Add missing” on a recommended dish, or <Link to="/home">find a dish</Link>.
        </p>
      ) : (
        <ul className="library-list">
          {items.map((item) => (
            <li className={`library-item shopping-item${item.done ? " shopping-item-done" : ""}`} key={item.name}>
              <label className="shopping-label">
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.name)} />
                <span>{titleCase(item.name)}</span>
              </label>
              <button
                type="button"
                className="btn-ct-ghost btn-ct-small"
                onClick={() => removeItem(item.name)}
                aria-label={`Remove ${item.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ShoppingList;
