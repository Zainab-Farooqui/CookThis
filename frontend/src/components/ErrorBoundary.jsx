import { Component } from "react";

/** Catches render errors so one broken component doesn't blank the whole app. */
class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="status-page">
        <span className="status-emoji">🔥</span>
        <h1>Something burned in the kitchen</h1>
        <p>An unexpected error happened. Reloading usually fixes it.</p>
        <button type="button" className="btn-ct-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
