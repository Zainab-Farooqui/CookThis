/** "green peas" -> "Green Peas" */
export function titleCase(text) {
  return String(text).replace(/\b\w/g, (c) => c.toUpperCase());
}
