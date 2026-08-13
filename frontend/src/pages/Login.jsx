import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SteamBowl from "../components/SteamBowl";
import { isValidEmail } from "../utils/validation";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !password) {
      return "Please fill in both email and password.";
    }
    if (!isValidEmail(email)) {
      return "Enter a valid email address.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await api.post("/users/login", {
        email: email.trim(),
        password,
      });
      login({ name: response.data.name, email: response.data.email });
      navigate("/home");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Login failed. Check your email and password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-card-wrap">
      <SteamBowl />
      <form className="recipe-card" onSubmit={handleSubmit} noValidate>
        <p className="recipe-eyebrow">Welcome back to the kitchen</p>
        <h1 className="recipe-title">Login</h1>

        {error && <div className="ct-alert ct-alert-error">{error}</div>}

        <div className="ct-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="ct-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-ct-primary" type="submit" disabled={loading}>
          {loading ? "Checking recipe…" : "Login"}
        </button>

        <p className="recipe-switch">
          New around here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;