export default function Navbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">AI Content Summarizer</div>
      </div>

      <div className="user-section">
        <span className="user-email">{user?.email || "User"}</span>
        <button type="button" onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
}
