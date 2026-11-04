
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="brand">AI Content Summarizer</div>

        <div className="user-section">
          <span>{user?.email || "User"}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <nav>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/summarize">Summarize</NavLink>
            <NavLink to="/summarizebyurl">Summarize Website</NavLink>
            <NavLink to="/summarizebyfile">Upload Document</NavLink>
            <NavLink to="/history">Summary History</NavLink>
          </nav>
        </aside>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
