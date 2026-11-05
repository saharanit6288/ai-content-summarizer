export default function FeedbackMessage({
  type = "info",
  message,
  onClose,
}) {
  if (!message) return null;

  return (
    <div
      className={`feedback-message feedback-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span>{message}</span>

      {onClose && (
        <button
          type="button"
          className="feedback-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}