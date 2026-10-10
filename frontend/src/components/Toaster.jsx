function Toaster({ toasts, onDismiss }) {
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`ct-toast ct-toast-${toast.type}`} key={toast.id}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="ct-toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
