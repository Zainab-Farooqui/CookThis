/** Placeholder cards shown while recommendations load. */
function ResultsSkeleton({ count = 6 }) {
  return (
    <div className="dish-results-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-pills">
            <span className="skeleton-pill" />
            <span className="skeleton-pill" />
            <span className="skeleton-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResultsSkeleton;
