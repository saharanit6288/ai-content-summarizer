import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSummaryStats } from "../api/summary.api";

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleString();
}

function getSummaryTitle(summary) {
  if (summary.sourceUrl) {
    return summary.sourceUrl;
  }

  if (summary.summaryText) {
    return summary.summaryText.slice(0, 90);
  }

  return `${summary.sourceType} summary`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await getSummaryStats();
        const data = response?.data ?? response;

        setStats(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p className="error-message">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const recentSummaries = stats?.recentSummaries ?? [];

  const statCards = [
    {
      label: "Total Summaries",
      value: stats?.totalSummaries ?? 0,
    },
    {
      label: "Completed",
      value: stats?.completedSummaries ?? 0,
    },
    {
      label: "Website Summaries",
      value: stats?.urlSummaries ?? 0,
    },
    {
      label: "Document Uploads",
      value:
        (stats?.pdfSummaries ?? 0) +
        (stats?.docxSummaries ?? 0),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to your AI Content Summarizer.</p>
        </div>

        <Link to="/summarize" className="dashboard-primary-button">
          + Create Summary
        </Link>
      </div>

      <section className="dashboard-stats">
        {statCards.map((card) => (
          <div className="dashboard-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="dashboard-source-stats">
        <h2>Summary Sources</h2>

        <div className="source-stat-list">
          <div>
            <span>Text</span>
            <strong>{stats?.textSummaries ?? 0}</strong>
          </div>

          <div>
            <span>Website URL</span>
            <strong>{stats?.urlSummaries ?? 0}</strong>
          </div>

          <div>
            <span>PDF</span>
            <strong>{stats?.pdfSummaries ?? 0}</strong>
          </div>

          <div>
            <span>DOCX</span>
            <strong>{stats?.docxSummaries ?? 0}</strong>
          </div>

          <div>
            <span>Failed</span>
            <strong>{stats?.failedSummaries ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-recent-section">
        <div className="dashboard-section-header">
          <h2>Recent Summaries</h2>
          <Link to="/history">View All</Link>
        </div>

        {recentSummaries.length === 0 ? (
          <div className="dashboard-empty">
            <p>You haven't created any summaries yet.</p>
            <Link to="/summarize">Create your first summary</Link>
          </div>
        ) : (
          <div className="dashboard-recent-list">
            {recentSummaries.map((summary) => (
              <div
                className="dashboard-recent-item"
                key={summary.id}
              >
                <div className="dashboard-recent-info">
                  <Link to={`/history/${summary.id}`}>
                    {getSummaryTitle(summary)}
                  </Link>

                  <div className="dashboard-recent-meta">
                    <span>{summary.sourceType}</span>
                    <span>{formatDate(summary.createdAt)}</span>
                    <span>{summary.status}</span>
                  </div>
                </div>

                <Link
                  to={`/history/${summary.id}`}
                  className="dashboard-view-link"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}