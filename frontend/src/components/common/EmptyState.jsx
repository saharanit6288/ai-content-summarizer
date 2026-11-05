import { Link } from "react-router-dom";

export default function EmptyState({
  title = "Nothing here yet",
  message = "There is no data to display.",
  actionLabel,
  actionTo,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📄</div>

      <h3>{title}</h3>

      <p>{message}</p>

      {actionLabel && actionTo && (
        <Link to={actionTo} className="primary-button">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}