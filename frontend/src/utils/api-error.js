export function getApiErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Check whether the backend is running.";
  }

  const status = error.response.status;
  const message = error.response.data?.message;

  if (status === 400) {
    return message || "Invalid request. Please check your input.";
  }

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return message || "The requested resource was not found.";
  }

  if (status === 413) {
    return "The uploaded file is too large.";
  }

  if (status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  if (status >= 500) {
    return "The server encountered an error. Please try again later.";
  }

  return message || "Something went wrong. Please try again.";
}