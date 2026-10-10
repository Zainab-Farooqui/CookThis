/** Simple strength estimate for the register form: score 0-4 plus a label. */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: "" };

  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (checks <= 1) return { score: 1, label: "Weak" };
  if (checks === 2) return { score: 2, label: "Fair" };
  if (checks === 3) return { score: 3, label: "Good" };
  return { score: 4, label: "Strong" };
}
