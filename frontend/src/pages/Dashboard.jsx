
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.email || "User"}!</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Summaries</h3>
          <p className="stat-number">--</p>
          <small>We'll connect this to the API next.</small>
        </div>

        <div className="dashboard-card">
          <h3>Website Summaries</h3>
          <p className="stat-number">--</p>
          <small>URL-based summaries</small>
        </div>

        <div className="dashboard-card">
          <h3>Document Summaries</h3>
          <p className="stat-number">--</p>
          <small>PDF and DOCX summaries</small>
        </div>
      </div>

      <div className="dashboard-card quick-action">
        <h2>Get started</h2>
        <p>Summarize text, a website, or an uploaded document.</p>
        <Link to="/summarize" className="primary-link">
          Create a summary
        </Link>
      </div>
    </div>
  );
}
