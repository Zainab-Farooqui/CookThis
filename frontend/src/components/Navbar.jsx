import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="ct-navbar">
      <Link to={user ? "/home" : "/"} className="ct-brand">
        <span className="ct-brand-mark">🍅</span>
        CookThis
      </Link>

      <nav className="ct-nav-links">
        {user ? (
          <>
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
    </header>
  );
}

export default Navbar;
