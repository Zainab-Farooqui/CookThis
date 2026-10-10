import { useState } from "react";

const THEME_KEY = "cookthis_theme";

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  // Bootstrap 5.3 reads this attribute to restyle its own inputs.
  document.documentElement.setAttribute("data-bs-theme", theme);
}

function initialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Light/dark theme. The choice is remembered; the first visit follows the OS setting. */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const t = initialTheme();
    apply(t);
    return t;
  });

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return { theme, toggle };
}
