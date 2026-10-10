import { useState } from "react";
import { passwordStrength } from "../utils/password";

function PasswordField({ id, label, value, onChange, autoComplete, showStrength = false }) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? passwordStrength(value) : null;

  return (
    <div className="ct-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>

      {strength && strength.score > 0 && (
        <div className="strength" aria-live="polite">
          <div className="strength-bars">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={`strength-bar${
                  level <= strength.score ? ` strength-bar-on strength-${strength.score}` : ""
                }`}
              />
            ))}
          </div>
          <span className="strength-label">{strength.label}</span>
        </div>
      )}
    </div>
  );
}

export default PasswordField;
