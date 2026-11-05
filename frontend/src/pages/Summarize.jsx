
import { useState } from "react";
import { createTextSummary } from "../api/summary.api";
import { getApiErrorMessage } from "../utils/api-error";
import FeedbackMessage from "../components/common/FeedbackMessage";
import Loading from "../components/common/Loading";

export default function Summarize() {
  const [inputText, setInputText] = useState("");
  const [wordLimit, setWordLimit] = useState(150);
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setSummaryText("");

    if (inputText.trim().length < 100) {
      setError("Please enter at least 100 characters.");
      return;
    }

    if (inputText.length > 100000) {
      setError("Text cannot exceed 100,000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await createTextSummary({
        inputText: inputText.trim(),
        wordLimit: Number(wordLimit),
      });

      // Support common API response structures.
      const payload = response?.data ?? response;

      const generatedSummary =
        payload?.summaryText ??
        payload?.summary?.summaryText ??
        payload?.data?.summaryText ??
        payload?.data?.summary?.summaryText;

      if (!generatedSummary) {
        console.log("Summary API response:", response);
        throw new Error(
          "The API responded, but the summary text was not found. Check the response structure."
        );
      }

      setSummaryText(generatedSummary);
      setSuccessMessage("Your summary was generated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInputText("");
    setSummaryText("");
    setSuccessMessage("");
    setError("");
    setSuccessMessage("");
  }

  return (
    <div className="summarize-page">
      <div className="page-heading">
        <h1>Summarize Text</h1>
        <p>Enter your content and let AI create a concise summary.</p>
      </div>

      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-group">
          <label htmlFor="inputText">Content to summarize</label>

          <textarea
            id="inputText"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Paste your article, blog, story, or other text here..."
            rows={12}
            minLength={100}
            maxLength={100000}
            required
          />

          <div className="character-count">
            {inputText.length.toLocaleString()} / 100,000 characters
          </div>
        </div>

        <div className="form-group word-limit-group">
          <label htmlFor="wordLimit">Summary word limit</label>

          <input
            id="wordLimit"
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
          <FeedbackMessage
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || inputText.trim().length < 100}
          >
            {loading ? "Generating summary..." : "Generate Summary"}
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
          <Loading message="Your content is being processed by the AI model. This may take a
            little time." />
        )}
      </form>

      {summaryText && (
        <section className="summary-result">
          <div className="result-heading">
            <h2>Generated Summary</h2>
            <span className="success-label">Completed</span>
          </div>

          {successMessage && (
            <FeedbackMessage
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage("")}
            />
          )}

          <div className="summary-output">
            {summaryText}
          </div>

          <div className="result-footer">
            Summary words: {summaryText.trim().split(/\s+/).length}
          </div>
        </section>
      )}
    </div>
  );
}
