import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import SteamBowl from "../components/SteamBowl";
import { isValidEmail } from "../utils/validation";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return "Please fill in every field.";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (!isValidEmail(email)) {
      return "Enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords don't match.";
    }
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post("/users/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess("Account created! Taking you to login…");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Registration failed. That email might already be in use.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-card-wrap">
      <SteamBowl />
      <form className="recipe-card" onSubmit={handleRegister} noValidate>
        <p className="recipe-eyebrow">Start your recipe box</p>
        <h1 className="recipe-title">Register</h1>

        {error && <div className="ct-alert ct-alert-error">{error}</div>}
        {success && <div className="ct-alert ct-alert-success">{success}</div>}

        <div className="ct-field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="ct-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="ct-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="ct-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="btn-ct-primary" type="submit" disabled={loading}>
          {loading ? "Preheating…" : "Register"}
        </button>

        <p className="recipe-switch">
          Already cooking with us? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;