
import { useState } from "react";
import { createUrlSummary } from "../api/summary.api";

export default function SummarizeUrl() {
  const [url, setUrl] = useState("");
  const [wordLimit, setWordLimit] = useState(150);
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSummaryText("");
    setSourceUrl("");

    const trimmedUrl = url.trim();

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Only HTTP and HTTPS website URLs are supported.");
        return;
      }
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    const numericWordLimit = Number(wordLimit);

    if (
      !Number.isInteger(numericWordLimit) ||
      numericWordLimit < 50 ||
      numericWordLimit > 500
    ) {
      setError("Word limit must be between 50 and 500.");
      return;
    }

    setLoading(true);

    try {
      const response = await createUrlSummary({
        url: trimmedUrl,
        wordLimit: numericWordLimit,
      });

      // Accommodate common API response wrappers.
      const payload = response?.data ?? response;

      const generatedSummary =
        payload?.summaryText ??
        payload?.summary?.summaryText ??
        payload?.data?.summaryText ??
        payload?.data?.summary?.summaryText;

      if (!generatedSummary) {
        console.log("URL summary API response:", response);
        throw new Error(
          "The API responded, but the summary text was not found. Check the response structure."
        );
      }

      setSummaryText(generatedSummary);
      setSourceUrl(
        payload?.sourceUrl ??
        payload?.summary?.sourceUrl ??
        trimmedUrl
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to summarize this website. Please try another URL.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setUrl("");
    setSummaryText("");
    setSourceUrl("");
    setError("");
  }

  return (
    <div className="summarize-page">
      <div className="page-heading">
        <h1>Summarize a Website</h1>
        <p>
          Enter a public article or blog URL. We'll extract its main content
          and generate an AI summary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-group">
          <label htmlFor="websiteUrl">Website URL</label>

          <input
            id="websiteUrl"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
            required
          />

          <small>
            Enter a publicly accessible HTTP or HTTPS webpage.
          </small>
        </div>

        <div className="form-group word-limit-group">
          <label htmlFor="urlWordLimit">Summary word limit</label>

          <input
            id="urlWordLimit"
            type="number"
            min="50"
            max="500"
            step="10"
            value={wordLimit}
            onChange={(event) => setWordLimit(event.target.value)}
            required
          />

          <small>Choose between 50 and 500 words.</small>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !url.trim()}
          >
            {loading ? "Extracting and summarizing..." : "Summarize Website"}
          </button>

          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {loading && (
          <p className="loading-message">
            Fetching the webpage, extracting its article, and generating your
            summary. This may take a little time.
          </p>
        )}
      </form>

      {summaryText && (
        <section className="summary-result">
          <div className="result-heading">
            <h2>Generated Summary</h2>
            <span className="success-label">Completed</span>
          </div>

          {sourceUrl && (
            <p className="source-url">
              <strong>Source:</strong>{" "}
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                {sourceUrl}
              </a>
            </p>
          )}

          <div className="summary-output">{summaryText}</div>

          <div className="result-footer">
            Summary words: {summaryText.trim().split(/\s+/).length}
          </div>
        </section>
      )}
    </div>
  );
}
