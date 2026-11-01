import { getAccessToken } from "./cognitoAuth";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const token = await getAccessToken();
  const isFormData = body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    const error = new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
    error.status = 0;
    throw error;
  }

  const raw = await res.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const error = new Error(
      data?.message || data?.error || "Something went wrong",
    );
    error.status = res.status;
    throw error;
  }

  return data;
}
