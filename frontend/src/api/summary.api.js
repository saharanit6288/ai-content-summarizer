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

export async function getSummaryHistory(params = {}) {
  const response = await api.get("/summaries", { params });
  return response.data;
}

export async function getSummaryById(id) {
  const response = await api.get(`/summaries/${id}`);
  return response.data;
}

export async function deleteSummary(id) {
  const response = await api.delete(`/summaries/${id}`);
  return response.data;
}

export async function getSummaryStats() {
  const response = await api.get("/summaries/stats");
  return response.data;
}
