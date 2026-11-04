import api from "./axios";

export async function createTextSummary(summaryData) {
  const response = await api.post("/summaries", summaryData);
  return response.data;
}

export async function createUrlSummary(summaryData) {
  const response = await api.post("/summaries/from-url", summaryData);
  return response.data;
}

export async function createFileSummary(formData, onUploadProgress) {
  const response = await api.post("/summaries/from-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}
