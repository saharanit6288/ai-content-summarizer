import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getSummaryById,
  deleteSummary,
} from "../api/summary.api";

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleString();
}

export default function SummaryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const response = await getSummaryById(id);

        // Supports an API response shaped as either:
        // { success: true, data: { ...summary } }
        // or { ...summary }
        const record = response?.data ?? response?.summary ?? response;

        if (!record?.id) {
          throw new Error("Summary record was not found in the API response.");
        }

        setSummary(record);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load summary."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this summary? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteSummary(id);

      navigate("/history", {
        replace: true,
        state: { message: "Summary deleted successfully." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete summary."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="page-container">Loading summary...</div>;
  }

  if (error && !summary) {
    return (
      <div className="page-container">
        <p className="error-message">{error}</p>
        <Link to="/history">Back to Summary History</Link>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page-container">
        <p>Summary not found.</p>
        <Link to="/history">Back to Summary History</Link>
      </div>
    );
  }

  const aiModelRun = summary.aiModelRun;

  return (
    <div className="page-container">
      <div className="details-header">
        <div>
          <h1>Summary Details</h1>
          <p>View your generated summary and its information.</p>
        </div>

        <div className="details-actions">
          <Link to="/history" className="secondary-button">
            Back to History
          </Link>

          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Summary"}
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section className="details-card">
        <h2>Summary Information</h2>

        <div className="details-grid">
          <div>
            <span>Source Type</span>
            <strong>{summary.sourceType || "Not available"}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{summary.status || "Not available"}</strong>
          </div>

          <div>
            <span>Requested Word Limit</span>
            <strong>{summary.requestedWordLimit ?? "Not available"}</strong>
          </div>

          <div>
            <span>Created At</span>
            <strong>{formatDate(summary.createdAt)}</strong>
          </div>

          <div>
            <span>Last Updated</span>
            <strong>{formatDate(summary.updatedAt)}</strong>
          </div>
        </div>

        {summary.sourceUrl && (
          <div className="source-url">
            <span>Source URL</span>
            <a
              href={summary.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {summary.sourceUrl}
            </a>
          </div>
        )}
      </section>

      <section className="details-card">
        <h2>Generated Summary</h2>

        {summary.summaryText ? (
          <div className="summary-content">
            {summary.summaryText}
          </div>
        ) : (
          <p>No summary text is available for this record.</p>
        )}
      </section>

      {aiModelRun && (
        <section className="details-card">
          <h2>AI Model Information</h2>

          <div className="details-grid">
            <div>
              <span>Provider</span>
              <strong>{aiModelRun.provider || "Not available"}</strong>
            </div>

            <div>
              <span>Model</span>
              <strong>{aiModelRun.model || "Not available"}</strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>
                {aiModelRun.durationMs != null
                  ? `${(aiModelRun.durationMs / 1000).toFixed(2)} seconds`
                  : "Not available"}
              </strong>
            </div>

            <div>
              <span>Output Words</span>
              <strong>{aiModelRun.outputWords ?? "Not available"}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}