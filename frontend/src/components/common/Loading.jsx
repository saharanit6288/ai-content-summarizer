export default function Loading({
  message = "Loading...",
}) {
  return (
    <div className="loading-container" role="status">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}