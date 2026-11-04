
import { useRef, useState } from "react";
import { createFileSummary } from "../api/summary.api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function SummarizeFile() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [wordLimit, setWordLimit] = useState(150);
  const [summaryText, setSummaryText] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSummaryText("");
    setSourceType("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setFile(null);
      event.target.value = "";
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";
      setError("File size cannot exceed 10 MB.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      event.target.value = "";
      setError("The selected file is empty.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSummaryText("");
    setSourceType("");
    setUploadProgress(0);

    if (!file) {
      setError("Please select a PDF or DOCX file.");
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

    const formData = new FormData();

    // This field name must match upload.single("file") in your backend.
    formData.append("file", file);
    formData.append("wordLimit", String(numericWordLimit));

    setLoading(true);

    try {
      const response = await createFileSummary(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadProgress(percentage);
        }
      });

      const payload = response?.data ?? response;

      const generatedSummary =
        payload?.summaryText ??
        payload?.summary?.summaryText ??
        payload?.data?.summaryText ??
        payload?.data?.summary?.summaryText;

      if (!generatedSummary) {
        console.log("File summary API response:", response);
        throw new Error(
          "The API responded, but the summary text was not found. Check the response structure."
        );
      }

      setSummaryText(generatedSummary);
      setSourceType(
        payload?.sourceType ??
        payload?.summary?.sourceType ??
        ""
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to summarize this document. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setFile(null);
    setSummaryText("");
    setSourceType("");
    setError("");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="summarize-page">
      <div className="page-heading">
        <h1>Summarize a Document</h1>
        <p>
          Upload a PDF or Word document to extract its content and generate
          an AI summary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-group">
          <label htmlFor="documentFile">Choose a document</label>

          <input
            ref={fileInputRef}
            id="documentFile"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={loading}
          />

          <small>Supported formats: PDF and DOCX. Maximum size: 10 MB.</small>
        </div>

        {file && (
          <div className="selected-file">
            <strong>Selected file:</strong> {file.name}
            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        )}

        <div className="form-group word-limit-group">
          <label htmlFor="fileWordLimit">Summary word limit</label>

          <input
            id="fileWordLimit"
            type="number"
            min="50"
            max="500"
            step="10"
            value={wordLimit}
            onChange={(event) => setWordLimit(event.target.value)}
            disabled={loading}
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
          <button type="submit" disabled={loading || !file}>
            {loading ? "Processing document..." : "Summarize Document"}
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
          <div className="upload-progress">
            <p>
              {uploadProgress < 100
                ? `Uploading document: ${uploadProgress}%`
                : "Upload complete. Generating your AI summary..."}
            </p>

            <progress value={uploadProgress} max="100" />
          </div>
        )}
      </form>

      {summaryText && (
        <section className="summary-result">
          <div className="result-heading">
            <h2>Generated Summary</h2>
            <span className="success-label">Completed</span>
          </div>

          {sourceType && (
            <p className="result-footer">Document type: {sourceType}</p>
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
