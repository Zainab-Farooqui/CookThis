const SORT_OPTIONS = [
  { value: "match", label: "Best match" },
  { value: "fewest_missing", label: "Fewest missing" },
  { value: "quickest", label: "Quickest" },
];

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

function FilterBar({ filters, onChange, options }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filter-bar">
      <label className="filter-field">
        <span>Diet</span>
        <select value={filters.diet} onChange={set("diet")}>
          <option value="">Any</option>
          {options.diets.map((d) => (
            <option key={d} value={d}>
              {titleCase(d)}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Course</span>
        <select value={filters.course} onChange={set("course")}>
          <option value="">Any</option>
          {options.courses.map((c) => (
            <option key={c} value={c}>
              {titleCase(c)}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Missing at most</span>
        <select value={filters.maxMissing} onChange={set("maxMissing")}>
          <option value="">Any number</option>
          <option value="0">0 (cook now)</option>
          <option value="1">1 ingredient</option>
          <option value="2">2 ingredients</option>
          <option value="3">3 ingredients</option>
        </select>
      </label>

      <label className="filter-field">
        <span>Sort by</span>
        <select value={filters.sort} onChange={set("sort")}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field filter-field-wide">
        <span>Avoid (comma separated)</span>
        <input
          type="text"
          placeholder="e.g. cashew, egg"
          value={filters.exclude}
          onChange={set("exclude")}
        />
      </label>
    </div>
  );
}

export default FilterBar;
