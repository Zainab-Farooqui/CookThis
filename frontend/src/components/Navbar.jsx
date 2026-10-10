import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useShoppingList } from "../context/ShoppingListContext";
import useTheme from "../hooks/useTheme";

const linkClass = ({ isActive }) => `ct-nav-link${isActive ? " ct-nav-link-active" : ""}`;

function Navbar() {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { remaining } = useShoppingList();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="ct-navbar">
      <Link to={user ? "/home" : "/"} className="ct-brand">
        <span className="ct-brand-mark">🍳</span>
        CookThis
      </Link>

      {/* Any click inside the menu (a link or Log out) closes it on mobile. */}
      <nav
        id="ct-main-nav"
        className={`ct-nav-links${menuOpen ? " ct-nav-links-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        {user ? (
          <>
            <NavLink to="/home" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/favorites" className={linkClass}>
              Favorites
              {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
            </NavLink>
            <NavLink to="/shopping" className={linkClass}>
              Shopping
              {remaining > 0 && <span className="nav-badge">{remaining}</span>}
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
            <span className="ct-greeting">Hi, {user.name.split(" ")[0]}!</span>
            <button className="btn-ct-ghost" onClick={handleLogout} type="button">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="btn-ct-ghost" style={{ display: "inline-block" }}>
              Login
            </Link>
            <Link to="/register" className="btn-ct-primary" style={{ display: "inline-block" }}>
              Register
            </Link>
          </>
        )}
      </nav>

      <div className="ct-nav-tools">
        <button
          type="button"
          className="icon-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          type="button"
          className="icon-btn ct-nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="ct-main-nav"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
