import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NotFound() {
  const { user } = useAuth();

  return (
    <div className="status-page">
      <span className="status-emoji">🍽️</span>
      <h1>This dish isn&apos;t on the menu</h1>
      <p>We couldn&apos;t find the page you were looking for.</p>
      <Link to={user ? "/home" : "/"} className="btn-ct-primary" style={{ display: "inline-block" }}>
        {user ? "Back to the kitchen" : "Go to login"}
      </Link>
    </div>
  );
}

export default NotFound;
