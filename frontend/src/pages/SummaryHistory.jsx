
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSummaryHistory } from "../api/summary.api";

const PAGE_SIZE = 3;


function normalizeHistoryResponse(response) {

  const summaries = Array.isArray(response?.data)
    ? response.data
    : [];

  const pagination = response?.pagination ?? {};

  return {
    summaries,
    total: pagination.totalRecords ?? summaries.length,
    currentPage: pagination.currentPage ?? 1,
    totalPages: pagination.totalPages ?? 1,
  };
}


function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString();
}

function getSummaryTitle(summary) {
  if (summary.title) return summary.title;

  if (summary.sourceUrl) return summary.sourceUrl;

  if (summary.inputText) {
    return summary.inputText.slice(0, 90);
  }

  return `${summary.sourceType || "Text"} summary`;
}

export default function SummaryHistory() {
  const [summaries, setSummaries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (sourceType) params.sourceType = sourceType;
        if (status) params.status = status;

        const response = await getSummaryHistory(params);
        const result = normalizeHistoryResponse(response);

        if (!isActive) return;

        setSummaries(result.summaries);
        setTotal(result.total);
        setPage(result.currentPage);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (!isActive) return;

        setSummaries([]);
        setTotal(0);
        setTotalPages(1);

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load summary history."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [page, sourceType, status]);

  function handleSourceTypeChange(event) {
    setSourceType(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  function handleClearFilters() {
    setSourceType("");
    setStatus("");
    setPage(1);
  }

  return (
    <div className="history-page">
      <div className="page-heading">
        <h1>Summary History</h1>
        <p>View and manage your previously generated summaries.</p>
      </div>

      <section className="history-filters">
        <div className="filter-group">
          <label htmlFor="sourceTypeFilter">Source type</label>
          <select
            id="sourceTypeFilter"
            value={sourceType}
            onChange={handleSourceTypeChange}
          >
            <option value="">All sources</option>
            <option value="TEXT">Text</option>
            <option value="URL">Website URL</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <button
          type="button"
          className="clear-button filter-clear-button"
          onClick={handleClearFilters}
          disabled={!sourceType && !status}
        >
          Clear filters
        </button>
      </section>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="history-message">Loading your summaries...</p>
      ) : summaries.length === 0 ? (
        <section className="history-empty">
          <h2>No summaries found</h2>
          <p>
            You haven't generated any summaries matching these filters.
          </p>
          <Link to="/summarize" className="primary-link">
            Create a summary
          </Link>
        </section>
      ) : (
        <>
          <div className="history-count">
            Showing {summaries.length} of {total} summaries
          </div>

          <div className="history-list">
            {summaries.map((summary) => (
              <article className="history-card" key={summary.id}>
                <div className="history-card-content">
                  <div className="history-card-heading">
                    <h2>{getSummaryTitle(summary)}</h2>

                    <span
                      className={`status-label ${
                        summary.status === "COMPLETED"
                          ? "status-completed"
                          : "status-failed"
                      }`}
                    >
                      {summary.status || "UNKNOWN"}
                    </span>
                  </div>

                  <div className="history-metadata">
                    <span>
                      Source: {summary.sourceType || "TEXT"}
                    </span>

                    <span>
                      Word limit: {summary.requestedWordLimit ?? "—"}
                    </span>

                    <span>
                      Created: {formatDate(summary.createdAt)}
                    </span>
                  </div>

                  {summary.summaryText && (
                    <p className="history-preview">
                      {summary.summaryText.slice(0, 180)}
                      {summary.summaryText.length > 180 ? "..." : ""}
                    </p>
                  )}
                </div>

                <div className="history-card-action">
                  <Link to={`/history/${summary.id}`}>
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
